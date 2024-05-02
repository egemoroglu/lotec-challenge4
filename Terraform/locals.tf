locals {
  bucket_name = "egemoroglu-lotec-challenge-4-tfstate"
  aws_ecr_url = "${data.aws_caller_identity.current.account_id}.dkr.ecr.eu-north-1.amazonaws.com"

  ecs_app_cluster_name         = "egemoroglu-lotec-challenge-4-cluster"
  availability_zones           = ["eu-north-1a", "eu-north-1b", "eu-north-1c"]
  ecs_app_task_family          = "egemoroglu-chall-4-task-family"
  container_port               = 3000
  ecs_app_task_name            = "egemoroglu-lotec-challenge-4-task"
  ecs_task_execution_role_name = "egemoroglu-lotec-challenge-4-task-execution-role"

  application_load_balancer_name = "egemorogly-lotec-challenge-4-alb"
  target_group_name              = "egemoroglu-chall-4-target-group"

  ecs_app_service_name = "egemoroglu-lotec-challenge-4-service"

}