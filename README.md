# 📅 Karyakram

**Karyakram** is a high-performance, robust Calendly-inspired scheduling application designed to handle complex timezone conversions, prevent double bookings, and manage scheduled email notifications with transaction-level guarantees. 

---

## 🏗️ System Architecture

Karyakram is structured as a decoupled full-stack application:

```mermaid
graph TD
    Client[Invitee / Admin Browser] -->|HTTP Requests| FE[Next.js Frontend]
    FE -->|API Proxy / Rewrite| BE[Express Backend]
    BE -->|Prisma Client| DB[(PostgreSQL Database)]
    BE -->|Background Worker| Mailer[Email Transporter]
```

*   **Frontend**: Next.js 16 (App Router), React 19, and Tailwind CSS 4.
*   **Backend**: Node.js, Express 5, TypeScript, and Prisma 7.
*   **Database**: PostgreSQL (storing users, recurring schedules, date overrides, custom booking questions, bookings, and notifications).

---

## ⚡ Technical Challenges & How They Are Solved

### 1. 🔒 Double-Booking Prevention (Transactional Advisory Locks)
When multiple invitees attempt to book the exact same slot concurrently, naive database checks can experience race conditions: both processes see the slot as free, and both successfully insert a booking (phantom read). Standard unique constraints on `(host_id, start_at)` are also insufficient due to overlapping durations, buffer times, and custom-length slots.

#### **The Solution:**
Karyakram uses **PostgreSQL Transaction-Level Advisory Locks** to completely serialize booking attempts *per host* without blocking the entire database:

```typescript
// Hash the host user's unique UUID to a 32-bit integer for PG
const lockKey = hashToInt(user.id);

// Acquire an exclusive transaction-level advisory lock
await client.query("SELECT pg_advisory_xact_lock($1)", [lockKey]);
```

1.  **Isolation**: The backend opens a transaction and hashes the host's `user_id` to a 32-bit integer.
2.  **Exclusive Locking**: It runs `SELECT pg_advisory_xact_lock(lockKey)`. This suspends concurrent booking transactions for **only** that specific host until the current transaction commits or rolls back.
3.  **Conflict Re-evaluation**: Inside the lock, the backend re-checks slot availability:
    ```sql
    SELECT 1 FROM bookings
    WHERE host_user_id = $1
      AND status = 'confirmed'
      AND start_at < $3 -- newEndAt
      AND end_at   > $2 -- newStartAt
    LIMIT 1
    ```
4.  **Commit/Rollback**: If a conflict is found, it rolls back and returns a `409 Slot Taken` error. Otherwise, the booking is safely written, and the lock is automatically released upon `COMMIT`.

---

### 2. 🌍 Timezones & Daylight Saving Time (DST) Edge Cases
Scheduling across countries involves dealing with varying host/invitee timezones and complex bi-annual Daylight Saving Time shifts (where local clocks jump forward or backward).

#### **The Solution:**
Karyakram decouples local "wall-clock" rules from physical UTC instants using the **Luxon** library:

*   **Decoupled Database Storage**: Recurring schedule bounds (e.g., `09:00` to `17:00`) are stored in `Time` columns without timezone dates. The schedule record specifies the host's IANA timezone (e.g. `America/New_York`).
*   **DST-Safe Expansion**: When calculating slots for a specific date (e.g., `2026-03-09`), the local time window is anchored to the host's local clock:
    ```typescript
    const startLocal = DateTime.fromISO(`${date}T${startTime}`, { zone: hostTz });
    const endLocal = DateTime.fromISO(`${date}T${endTime}`, { zone: hostTz });
    ```
    If local clocks skip forward over a scheduled window (a DST gap), `startLocal.isValid` becomes `false`. The backend detects this and discards the invalid slots safely.
*   **Standardized UTC Comparison**: Once local times are verified as valid local instances, they are converted to UTC via `.toUTC()` and matched against database bookings stored as `TIMESTAMPTZ`. This ensures search, selection, and overlap checks are mathematically standardized on UTC.

---

### 3. 📧 Email Notifications (Transactional Queue + Polling Worker)
Sending emails synchronously during a booking request degrades performance and introduces reliability issues if the email service goes down. Furthermore, if a booking transaction rolls back, sending a confirmation email anyway would be catastrophic.

#### **The Solution:**
Karyakram implements an asynchronous, database-backed **Transactional Outbox Queue**:

```mermaid
sequenceDiagram
    participant Invitee
    participant Backend Transaction
    participant DB (bookings & notifications)
    participant Background Worker
    participant SMTP

    Invitee->>Backend Transaction: Submit Booking
    Note over Backend Transaction: Aquire Advisory Lock
    Backend Transaction->>DB (bookings & notifications): Insert confirmed booking & enqueue pending notifications (Confirmation, 24h, 1h)
    Backend Transaction->>Invitee: Return 201 Success
    Note over Backend Transaction: Commit transaction & Release Lock
    
    loop Every 15 Seconds
        Background Worker->>DB (bookings & notifications): Poll pending notifications due (scheduled_at <= now())
        DB (bookings & notifications)-->>Background Worker: Return due notifications
        Background Worker->>SMTP: Dispatch emails via Nodemailer
        Background Worker->>DB (bookings & notifications): Update status to 'sent' (or 'failed')
    end
```

1.  **Atomic Enqueueing**: In the same database transaction where the booking is confirmed, Karyakram inserts the future notifications (immediate confirmation, `24h` reminder, and `1h` reminder) into a `notifications` table:
    ```sql
    INSERT INTO notifications (booking_id, recipient_email, type, scheduled_at)
    VALUES ($1, $2, 'reminder_24h', $3 -- start_at - 24 hours)
    ```
    This guarantees that if the booking transaction fails, no email records are created.
2.  **Stateful Polling Worker**: An Express background worker runs on a `15-second` interval:
    *   It queries for pending notifications that are due: `scheduledAt <= new Date()`.
    *   It renders the formatted times in both the host's and invitee's local timezones.
    *   It sends the email using `nodemailer`.
    *   It updates the notification status to `sent` (along with `sentAt` timestamp) or marks it as `failed` if an error occurs.
3.  **Dev Mode Logging**: For local testing, a `streamTransport` is used to log the emails directly to the console instead of relying on real SMTP credentials.

---

## 🛠️ Quick Start

### 1. Database
Set up a PostgreSQL database and configure the connection strings in `backend/.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/karyakram?pgbouncer=true"
DIRECT_URL="postgresql://postgres:password@localhost:5432/karyakram"
PORT=4000
```

### 2. Backend Setup & Run
```bash
cd backend
npm install
npx prisma migrate deploy
npx tsx prisma/seed.ts
npm run dev
```
*The Express API will boot up on **http://localhost:4000** and output `📧 Notification worker started — polling every 15s`.*

### 3. Frontend Setup & Run
```bash
cd frontend
npm install
npm run dev
```
*Open **http://localhost:3000** to load the Next.js frontend dashboard.*
