locals {
  bucket_name = "lotec-challenge-4-egemoroglu-tfstate"
  aws_ecr_url = "${data.aws_caller_identity.current.account_id}.dkr.ecr.us-east-1.amazonaws.com"

}