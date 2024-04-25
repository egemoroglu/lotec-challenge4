resource "aws_dynamodb_table" "egemoroglu-users" {
    name           = "egemoroglu-users"
    billing_mode   = "PAY_PER_REQUEST"
    hash_key       = "userId"
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
        name = "username-index"
        hash_key = "username"
        projection_type = "ALL"
    }
    global_secondary_index {
        name = "password-index"
        hash_key = "password"
        projection_type = "ALL"
    }
  
}

resource "aws_dynamodb_table" "egemoroglu-todos" {
    name = "egemoroglu-todos"
    billing_mode = "PAY_PER_REQUEST"
    hash_key = "todoId"
    attribute {
        name = "todoId"
        type = "S"
    }
    attribute {
        name = "title"
        type = "S"
    }
    attribute {
        name = "assignee"
        type = "S"
    }
    attribute {
        name = "status"
        type = "S"
    }
    global_secondary_index {
        name = "assignee-index"
        hash_key = "assignee"
        projection_type = "ALL"
    }
    global_secondary_index {
        name = "status-index"
        hash_key = "status"
        projection_type = "ALL"
    }
    global_secondary_index {
        name = "title-index"
        hash_key = "title"
        projection_type = "ALL"
    }
  
}