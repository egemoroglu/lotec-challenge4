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