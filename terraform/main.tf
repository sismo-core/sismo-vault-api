data "aws_route53_zone" "sismo" {
  name = local.env.dns_zone

  provider = aws.shared
}

module "sls-cloudfront" {
  source  = "neovops/sls-cloudfront/aws"
  version = "0.1.2"

  sls_service_name = "sismo-vault"
  sls_stage        = terraform.workspace

  zone_name    = data.aws_route53_zone.sismo.name
  domain_names = [local.env.domain]

  providers = {
    aws           = aws
    aws.route53   = aws.shared
    aws.us-east-1 = aws.us-east-1
  }
}

