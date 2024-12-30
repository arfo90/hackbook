import { Construct } from 'constructs';
import { App, TerraformStack, TerraformOutput } from 'cdktf';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { S3Bucket } from '@cdktf/provider-aws/lib/s3-bucket';
import { S3BucketVersioningA } from '@cdktf/provider-aws/lib/s3-bucket-versioning';
import { S3BucketServerSideEncryptionConfigurationA } from '@cdktf/provider-aws/lib/s3-bucket-server-side-encryption-configuration';
import { DynamodbTable } from '@cdktf/provider-aws/lib/dynamodb-table';

const config = {
  region: 'us-west-2',
  project: 'hackbook',
  environment: 'dev'
};

class BackendStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new AwsProvider(this, 'aws', {
      region: config.region
    });

    const stateBucket = new S3Bucket(this, 'terraform-state', {
      bucket: `${config.project}-${config.environment}-terraform-state`,
      forceDestroy: true
    });

    new S3BucketVersioningA(this, 'state-bucket-versioning', {
      bucket: stateBucket.id,
      versioningConfiguration: {
        status: 'Enabled'
      }
    });

    new S3BucketServerSideEncryptionConfigurationA(this, 'state-bucket-encryption', {
      bucket: stateBucket.id,
      rule: [{
        applyServerSideEncryptionByDefault: {
          sseAlgorithm: 'AES256'
        }
      }]
    });

    const lockTable = new DynamodbTable(this, 'terraform-locks', {
      name: `${config.project}-${config.environment}-terraform-locks`,
      billingMode: 'PAY_PER_REQUEST',
      hashKey: 'LockID',
      attribute: [{
        name: 'LockID',
        type: 'S'
      }]
    });

    new TerraformOutput(this, 'state_bucket_name', {
      value: stateBucket.id
    });

    new TerraformOutput(this, 'dynamodb_table_name', {
      value: lockTable.name
    });
  }
}

const app = new App();
new BackendStack(app, 'terraform-backend');
app.synth();