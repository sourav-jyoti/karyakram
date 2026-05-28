# ==================== EKS Cluster Control Plane ====================

resource "aws_eks_cluster" "this" {
  name     = var.cluster_name
  role_arn = aws_iam_role.eks_cluster.arn

  vpc_config {
    subnet_ids = [
      aws_subnet.public_1.id,
      aws_subnet.public_2.id,
      aws_subnet.private_1.id,
      aws_subnet.private_2.id
    ]
    endpoint_private_access = true
    endpoint_public_access  = true
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy
  ]
}

# ==================== EKS Managed Node Group ====================

resource "aws_eks_node_group" "this" {
  cluster_name    = aws_eks_cluster.this.name
  node_group_name = "karyakram-worker-nodes"
  node_role_arn   = aws_iam_role.eks_nodes.arn

  # Worker nodes reside securely inside private subnets
  subnet_ids = [
    aws_subnet.private_1.id,
    aws_subnet.private_2.id
  ]

  scaling_config {
    desired_size = var.node_desired_size
    max_size     = 3
    min_size     = 1
  }

  update_config {
    max_unavailable = 1
  }

  instance_types = [var.node_instance_type]

  # Ensure node policies are attached before nodes boot up
  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_ecr_read_only
  ]

  tags = {
    Name = "karyakram-node"
  }
}
