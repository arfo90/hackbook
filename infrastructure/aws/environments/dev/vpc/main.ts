// environments/dev/vpc/main.ts
import { Construct } from 'constructs';
import { App, TerraformStack, TerraformOutput, S3Backend } from 'cdktf';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { VpcConstruct } from '../../../modules/vpc/main';
import { config } from './config';

class DevVpcStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Configure S3 Backend
    new S3Backend(this, {
      bucket: `${config.project}-${config.environment}-terraform-state`,
      key: "vpc/terraform.tfstate",
      region: config.region,
      dynamodbTable: `${config.project}-${config.environment}-terraform-locks`
    });

    new AwsProvider(this, 'aws', {
      region: config.region
    });

    const vpc = new VpcConstruct(this, 'vpc', config.vpc);

    new TerraformOutput(this, 'vpc_id', {
      value: vpc.vpcId
    });

    new TerraformOutput(this, 'private_subnet_ids', {
      value: vpc.privateSubnetIds
    });

    new TerraformOutput(this, 'public_subnet_ids', {
      value: vpc.publicSubnetIds
    });
  }
}

const app = new App();
new DevVpcStack(app, 'dev-vpc');
app.synth();