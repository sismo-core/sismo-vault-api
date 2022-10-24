# Sismo Vault API

The sismo vault API is a simple API that allows to store some encrypted data on a persistent storage.

# Endpoints

## Add encrypted data

Endpoint: `https://vault-api.sismo.io/add`

Method: `POST`

Parameters:

- `token` : A random secret of the user.
- `ciphertext` : Some encrypted text to store on the vault.

Response:

- `id` : The `hash(token)` that serve to retrieve a vault.
- `ciphertext` : The encrypted text to store on the vault provided in parameters.

Example:

```bash
$ curl -X POST -H 'content-type: application/json' https://vault-api.sismo.io/add -d @- <<EOF
{
  "token": "pookie",
  "ciphertext": "0x123...example of encrypted text",
  "version": "1",
}
EOF

{
  "id": "2586915241cb56033a4eabb0fec9664775e2ab26866fa9109732556ccf440b0a",
  "ciphertext": "0x123...example of encrypted text",
  "version": "1",
}
```

## Retrieve encrypted data

Endpoint: `https://vault-api.sismo.io/retrieve`

Method: `GET`

Parameters:

- `id` : The `hash(token)` that serve as identifier to retrieve the ciphertext.

Response:

- `id` : The `hash(token)` that serve as identifier to retrieve the ciphertext.
- `ciphertext` : The retrieved encrypted text which was saved on the vault.

Example:

```bash
$ curl https://vault-api.sismo.io/retrieve?id=2586915241cb56033a4eabb0fec9664775e2ab26866fa9109732556ccf440b0a

{
  "id": "2586915241cb56033a4eabb0fec9664775e2ab26866fa9109732556ccf440b0a",
  "ciphertext": "0x123...example of encrypted text",
  "version": "1",
}
```

# Deployements

## Deployment step

Deploy with serverless

Example: staging deployment

```bash
sls deploy --stage staging
```

Then deploy the CloudFront with terraform in the `./terraform` folder

```bash
terraform workspace select staging
terraform apply
```

## Deployed endpoints

**prod**: `vault-api.sismo.io`  
**staging**: `vault-api.zikies.io`

# Developper

## Installation

Install dependencies.

```bash
yarn
```

Run the docker-compose

```bash
docker-compose up
```

## Tests

Run the test suite

```bash
yarn test
```
