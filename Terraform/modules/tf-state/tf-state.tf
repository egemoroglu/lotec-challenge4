resource "aws_s3_bucket" "terraform_state" {
    bucket = var.bucket_name
    force_destroy = true
}

resource "aws_s3_bucket_versioning" "terraform_bucket_versioning" {
    bucket = aws_s3_bucket.terraform_state.id
    versioning_configuration{
        status = "Enabled"
    }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_server_side_encrypto_conf"{
    bucket = aws_s3_bucket.terraform_state.bucket
    rule {
        apply_server_side_encryption_by_default {
            sse_algorithm = "AES256"
        }
    }
}