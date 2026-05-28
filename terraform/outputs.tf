output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.eks_vpc.id
}

output "eks_cluster_name" {
  description = "The name of the EKS Cluster"
  value       = aws_eks_cluster.this.name
}

output "eks_cluster_endpoint" {
  description = "The endpoint of your EKS Kubernetes API server"
  value       = aws_eks_cluster.this.endpoint
}

output "eks_cluster_certificate_authority_data" {
  description = "Certificate authority data for cluster connection validation"
  value       = aws_eks_cluster.this.certificate_authority[0].data
}

output "eks_node_role_arn" {
  description = "The IAM Role ARN assigned to the worker node EC2 instances"
  value       = aws_iam_role.eks_nodes.arn
}
