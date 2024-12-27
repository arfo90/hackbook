import { Construct } from 'constructs';
import { TerraformHclModule } from 'cdktf';

export interface VpcConfig {
    name: string;
    cidr: string;
    azs: string[];
    private_subnets: string[];
    public_subnets: string[];
    enable_nat_gateway: boolean;
    single_nat_gateway: boolean;
    enable_dns_hostnames: boolean;
    enable_dns_support: boolean;
    tags?: { [key: string]: string };
  }

export class VpcConstruct extends Construct {
    public readonly vpcId: string;
    public readonly privateSubnetIds: string[];
    public readonly publicSubnetIds: string[];

    constructor(scope: Construct, name: string, config: VpcConfig) {
        super(scope, name);
    
        const vpc = new TerraformHclModule(this, 'vpc', {
          source: 'terraform-aws-modules/vpc/aws',
          version: '5.0.0',
          variables: config,
        });
    
        this.vpcId = vpc.get('vpc_id');
        this.privateSubnetIds = vpc.get('private_subnets');
        this.publicSubnetIds = vpc.get('public_subnets');
      }
}