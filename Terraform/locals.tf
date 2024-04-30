locals {
  bucket_name = "egemoroglu-lotec-challenge-4-tfstate"
  aws_ecr_url = "${data.aws_caller_identity.current.account_id}.dkr.ecr.eu-north-1.amazonaws.com"
}