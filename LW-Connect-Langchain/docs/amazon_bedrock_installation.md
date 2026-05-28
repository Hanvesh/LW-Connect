# Amazon Bedrock Installation Guide

This guide explains how to install and configure the tools required to connect LW-Connect to Amazon Bedrock.

## 1. Prerequisites

- AWS account with Bedrock access.
- AWS credentials configured locally.
- Python 3.11+ environment.
- `pip` available in the runtime environment.

## 2. Install Bedrock dependencies

Install the AWS SDK and Bedrock-compatible packages:

```bash
pip install boto3 botocore
```

Optional but recommended for CLI troubleshooting:

```bash
pip install awscli
```

## 3. Configure AWS credentials

Configure AWS credentials with `aws configure` or environment variables.

Using the AWS CLI:

```bash
aws configure
```

Then provide:

- `AWS Access Key ID`
- `AWS Secret Access Key`
- `Default region name` (example: `us-west-2`)
- `Default output format` (optional)

Alternatively, set these environment variables:

```bash
export AWS_ACCESS_KEY_ID="YOUR_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="YOUR_SECRET_ACCESS_KEY"
export AWS_REGION="us-west-2"
```

## 4. Configure LW-Connect for Bedrock

The current LW-Connect setup uses OpenAI by default. To enable Amazon Bedrock, add Bedrock-specific environment variables to your `.env` file.

Example additions:

```bash
# AWS Bedrock
AWS_REGION=us-west-2
BEDROCK_MODEL=anthropic.claude-v2
BEDROCK_API_TIMEOUT=60
```

> Note: Replace `anthropic.claude-v2` with the Bedrock model you want to use.

## 5. Validate installation

Verify that `boto3` is installed and AWS credentials are accessible:

```bash
python -c "import boto3; print(boto3.Session().region_name)"
```

If the command prints your AWS region, the Bedrock installation environment is configured correctly.

## 6. Using Bedrock with LW-Connect

This repo currently has core AI integration for OpenAI. To use Amazon Bedrock as the LLM provider, you will need to add or extend Bedrock support in the application code.

A minimal Bedrock call example:

```python
import boto3

client = boto3.client('bedrock', region_name='us-west-2')
response = client.invoke_model(
    modelId='anthropic.claude-v2',
    contentType='application/json',
    body='{"inputText": "Tell me about AI mentorship."}'
)
print(response['body'].read().decode('utf-8'))
```

## 7. Add Bedrock packages to requirements

If you want Bedrock support to be reproducible for the project, add these dependencies to `requirements.txt`:

```text
boto3>=1.30.0
botocore>=1.33.0
awscli>=1.29.0
```

## 8. Next steps

- Add Bedrock configuration handling in `app/config.py`.
- Add a Bedrock wrapper or LangChain integration point in `app/conversational_assistant.py`.
- Update `README.md` or deployment docs with Bedrock usage notes.
