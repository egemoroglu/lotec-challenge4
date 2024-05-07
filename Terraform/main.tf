terraform {

  backend "s3" {
    bucket = "lotec-challenge-4-egemoroglu-tfstate"
    key    = "terraform.tfstate"
    region = "us-east-1"

  }


  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 3.76.1"
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
  name                 = "egemoroglu-ecr-repository"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "docker_image" "backend" {
  name = "${aws_ecr_repository.egemoroglu-ecr-repository.repository_url}:latest"
  build {
    context    = "../ServerSide"
    dockerfile = "backend.dockerfile"
  }
  provisioner "local-exec" {
    command = "aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${aws_ecr_repository.egemoroglu-ecr-repository.repository_url}"
  }
  provisioner "local-exec" {
    command = "docker push ${aws_ecr_repository.egemoroglu-ecr-repository.repository_url}:latest"
  }
}



resource "aws_s3_bucket" "egemoroglu-lotec-challenge-4-frontend" {
  bucket = "egemoroglu-lotec-challenge-4-frontend"

}

resource "aws_s3_bucket_cors_configuration" "egemoroglu-lotec-challenge-4-frontend-cors-rules" {
  bucket = aws_s3_bucket.egemoroglu-lotec-challenge-4-frontend.bucket
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }

}
resource "aws_s3_bucket_versioning" "egemoroglu-lotec-challenge-4-frontend-versioning" {
  bucket = aws_s3_bucket.egemoroglu-lotec-challenge-4-frontend.bucket

  versioning_configuration {
    status = "Disabled"

  }

}

resource "aws_s3_bucket_public_access_block" "egemoroglu-lotec-challenge-4-frontend-frontend" {
  bucket = aws_s3_bucket.egemoroglu-lotec-challenge-4-frontend.bucket

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_website_configuration" "egemoroglu-lotec-challenge-4-frontend" {
  bucket = aws_s3_bucket.egemoroglu-lotec-challenge-4-frontend.bucket

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"

  }

}

resource "aws_s3_bucket_server_side_encryption_configuration" "egemoroglu-lotec-challenge-4-frontend" {
  bucket = aws_s3_bucket.egemoroglu-lotec-challenge-4-frontend.bucket

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }

}

resource "null_resource" "sync_files_to_s3" {
  triggers = {
    bucket_id = aws_s3_bucket.egemoroglu-lotec-challenge-4-frontend.bucket
  }

  provisioner "local-exec" {
    command = "aws s3 sync ../ClientSide/dist s3://${aws_s3_bucket.egemoroglu-lotec-challenge-4-frontend.bucket}"
  }

}

resource "aws_s3_bucket_policy" "bucket_policy" {
  bucket = aws_s3_bucket.egemoroglu-lotec-challenge-4-frontend.id
  policy = data.aws_iam_policy_document.egemoroglu_challenge_4_bucket_policy.json
}


data "aws_iam_policy_document" "egemoroglu_challenge_4_bucket_policy" {
  depends_on = [
    aws_s3_bucket.egemoroglu-lotec-challenge-4-frontend
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
      "arn:aws:s3:::${aws_s3_bucket.egemoroglu-lotec-challenge-4-frontend.bucket}/*"
    ]
  }

}
resource "aws_cloudfront_distribution" "lotec-challenge-4-egemoroglu" {
  depends_on = [
    aws_s3_bucket.egemoroglu-lotec-challenge-4-frontend,
  ]
  origin {
    domain_name = aws_s3_bucket.egemoroglu-lotec-challenge-4-frontend.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.egemoroglu-lotec-challenge-4-frontend.id
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
    target_origin_id       = aws_s3_bucket.egemoroglu-lotec-challenge-4-frontend.id
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

resource "aws_iam_role" "app_runner_role" {
  name = "app_runner_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "build.apprunner.amazonaws.com",
        }
        Action = "sts:AssumeRole",
      }
    ]
  })
}

resource "aws_iam_policy" "ecr_policy" {
  name        = "ecr_policy"
  description = "IAM policy to allow AppRunner access to ECR"

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:DescribeImages"
        ],
        Resource = "*",
      },
    ],
  })
}

resource "aws_iam_role_policy_attachment" "ecr_policy_attachment" {
  role       = aws_iam_role.app_runner_role.name
  policy_arn = aws_iam_policy.ecr_policy.arn
}



resource "aws_apprunner_service" "lotec_challenge_4_egemoroglu_apprunner" {
  service_name = "lotec_challenge_4_egemoroglu_apprunner"

  source_configuration {
    image_repository {
      image_configuration {
        port = "3000"

      }
      image_identifier      = "${aws_ecr_repository.egemoroglu-ecr-repository.repository_url}:latest"
      image_repository_type = "ECR"
    }
    auto_deployments_enabled = true
    authentication_configuration {
      access_role_arn = aws_iam_role.app_runner_role.arn
    }
  }
  health_check_configuration {
    healthy_threshold   = 3
    interval            = 5
    path                = "/"
    protocol            = "TCP"
    timeout             = 5
    unhealthy_threshold = 3
  }
  instance_configuration {
    cpu    = "1024"
    memory = "2048"
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