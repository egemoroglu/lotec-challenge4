terraform {
  backend "s3" {
    bucket  = "egemoroglu-lotec-challenge-4-tfstate"
    key     = "terraform.tfstate"
    region  = "eu-north-1"
    encrypt = true
  }


  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.0"
    }

    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 2.13"

    }
  }
}
module "tf-state" {
  source      = "./modules/tf-state"
  bucket_name = local.bucket_name

}
resource "aws_ecr_repository" "egemoroglu-ecr-repository" {
  name = "egemoroglu-ecr-repository"
}

resource "docker_image" "backend" {
  name = "${aws_ecr_repository.egemoroglu-ecr-repository.repository_url}:latest"
  build {
    context    = "../ServerSide"
    dockerfile = "backend.dockerfile"
  }
  provisioner "local-exec" {
    command = "aws ecr get-login-password --region eu-north-1 | docker login --username AWS --password-stdin ${aws_ecr_repository.egemoroglu-ecr-repository.repository_url}"
  }
  provisioner "local-exec" {
    command = "docker push ${aws_ecr_repository.egemoroglu-ecr-repository.repository_url}:latest"
  }


}

module "ecsCluster" {
  source = "./modules/ecs"

  ecs_app_cluster_name = local.ecs_app_cluster_name
  availability_zone    = local.availability_zones

  ecs_app_task_family          = local.ecs_app_task_family
  ecr_repo_url                 = aws_ecr_repository.egemoroglu-ecr-repository.repository_url
  container_port               = local.container_port
  ecs_app_task_name            = local.ecs_app_task_name
  ecs_task_execution_role_name = local.ecs_task_execution_role_name


  application_load_balancer_name = local.application_load_balancer_name
  target_group_name              = local.target_group_name
  ecs_app_service_name           = local.ecs_app_service_name
}

resource "aws_s3_bucket" "lotec-challenge-4-egemoroglu-frontend" {
  bucket = "lotec-challenge-4-egemoroglu-frontend"

}

resource "aws_s3_bucket_cors_configuration" "lotec-challenge-4-egemoroglu-frontend-cors_rules" {
  bucket = aws_s3_bucket.lotec-challenge-4-egemoroglu-frontend.bucket
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }

}
resource "aws_s3_bucket_versioning" "lotec-challenge-4-egemoroglu-frontend-versioning" {
  bucket = aws_s3_bucket.lotec-challenge-4-egemoroglu-frontend.bucket

  versioning_configuration {
    status = "Disabled"

  }

}

resource "aws_s3_bucket_public_access_block" "lotec-challenge-4-egemoroglu-frontend" {
  bucket = aws_s3_bucket.lotec-challenge-4-egemoroglu-frontend.bucket

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_website_configuration" "lotec-challenge-4-egemoroglu-frontend" {
  bucket = aws_s3_bucket.lotec-challenge-4-egemoroglu-frontend.bucket

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"

  }

}

resource "aws_s3_bucket_server_side_encryption_configuration" "lotec-challenge-4-egemoroglu-frontend" {
  bucket = aws_s3_bucket.lotec-challenge-4-egemoroglu-frontend.bucket

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }

}

resource "null_resource" "sync_files_to_s3" {
  triggers = {
    bucket_id = aws_s3_bucket.lotec-challenge-4-egemoroglu-frontend.bucket
  }

  provisioner "local-exec" {
    command = "aws s3 sync ../ClientSide/dist s3://${aws_s3_bucket.lotec-challenge-4-egemoroglu-frontend.bucket}"
  }

}

resource "aws_s3_bucket_policy" "bucket_policy" {
  # depends_on = [
  #   aws_cloudfront_distribution.lotec-challenge-4-egemoroglu
  # ]
  bucket = aws_s3_bucket.lotec-challenge-4-egemoroglu-frontend.id
  policy = data.aws_iam_policy_document.bucket_policy.json
}


data "aws_iam_policy_document" "bucket_policy" {
  depends_on = [
    aws_s3_bucket.lotec-challenge-4-egemoroglu-frontend
  ]

  statement {
    sid    = "PublicReadGetObject"
    effect = "Allow"
    actions = [
      "s3:GetObject"
    ]

    principals {
      identifiers = ["*"]
      type        = "*"
    }

    resources = [
      "arn:aws:s3:::${aws_s3_bucket.lotec-challenge-4-egemoroglu-frontend.bucket}/*"
    ]



  }

}
resource "aws_cloudfront_distribution" "lotec-challenge-4-egemoroglu" {
  depends_on = [
    aws_s3_bucket.lotec-challenge-4-egemoroglu-frontend,
  ]
  origin {
    domain_name = aws_s3_bucket.lotec-challenge-4-egemoroglu-frontend.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.lotec-challenge-4-egemoroglu-frontend.id
  }
  enabled             = true
  default_root_object = "index.html"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    target_origin_id       = aws_s3_bucket.lotec-challenge-4-egemoroglu-frontend.id
    viewer_protocol_policy = "allow-all"
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }


  }
  viewer_certificate {
    cloudfront_default_certificate = true
  }

}




resource "aws_dynamodb_table" "egemoroglu-users" {
  name         = "egemoroglu-users"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "userId"
  attribute {
    name = "userId"
    type = "S"
  }
  attribute {
    name = "username"
    type = "S"
  }
  attribute {
    name = "password"
    type = "S"
  }
  global_secondary_index {
    name            = "username-index"
    hash_key        = "username"
    projection_type = "ALL"
  }
  global_secondary_index {
    name            = "password-index"
    hash_key        = "password"
    projection_type = "ALL"
  }

}

resource "aws_dynamodb_table" "egemoroglu-todos" {
  name         = "egemoroglu-todos"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "todoId"
  attribute {
    name = "todoId"
    type = "S"
  }
  attribute {
    name = "title"
    type = "S"
  }
  attribute {
    name = "username"
    type = "S"
  }
  attribute {
    name = "status"
    type = "S"
  }
  global_secondary_index {
    name            = "username-index"
    hash_key        = "username"
    projection_type = "ALL"
  }
  global_secondary_index {
    name            = "status-index"
    hash_key        = "status"
    projection_type = "ALL"
  }
  global_secondary_index {
    name            = "title-index"
    hash_key        = "title"
    projection_type = "ALL"
  }

}