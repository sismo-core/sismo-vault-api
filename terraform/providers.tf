locals {
  role_name = "sismo-admin"
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = "eu-west-1"

  assume_role {
    role_arn     = "arn:aws:iam::${local.env.account_id}:role/${local.role_name}"
    session_name = "terraform"
  }
}

provider "aws" {
  alias = "us-east-1"

  region = "us-east-1"

  assume_role {
    role_arn     = "arn:aws:iam::${local.env.account_id}:role/${local.role_name}"
    session_name = "terraform"
  }
}

provider "aws" {
  alias = "shared"

  region = "eu-west-1"

  assume_role {
    role_arn     = "arn:aws:iam::651622860961:role/sismo-admin"
    session_name = "terraform"
  }
}
