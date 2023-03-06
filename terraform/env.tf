locals {
  envs_config = {
    staging = {
      account_id = "934818791296" # staging-common
      dns_zone   = "zikies.io"
      domain     = "vault-api.zikies.io"
    },
    prod = {
      account_id = "214635901820" # prod-common
      dns_zone   = "sismo.io"
      domain     = "vault-api.sismo.io"
    }
    prod-beta = {
      account_id = "214635901820" # prod-common
      dns_zone   = "sismo.io"
      domain     = "vault-beta-api.sismo.io"
    }
  }
  env_name = terraform.workspace
  env      = local.envs_config[local.env_name]
}
