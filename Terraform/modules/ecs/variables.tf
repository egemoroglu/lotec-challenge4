variable "ecs_app_cluster_name" {
  description = "ECS cluster name"
  type        = string
  
}

variable "availability_zone" {
    description = "eu-north-1 AZs"
    type = list(string)
}

variable "ecs_app_task_family" {
  description = "ECS task family"
  type        = string
}
variable "ecs_task_execution_role_name" {
  description = "ECS Task Execution Role Name"
  type        = string
}

variable "ecr_repo_url" {
  description = "ECR repo url"
    type        = string
}

variable "container_port" {
    description = "Container port"
    type        = number
  
}

variable "ecs_app_task_name" {
    description = "ECR task name"
    type        = string
}

variable "application_load_balancer_name" {
    description = "ALB Name"
    type        = string
  
}

variable "target_group_name" {
    description = "ALB Target Group Name"
    type        = string
}

variable "ecs_app_service_name" {
    description = "ECR service name"
    type        = string
  
}