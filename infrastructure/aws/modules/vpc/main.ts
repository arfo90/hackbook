import { Construct } from 'constructs';
import { TerraformHclModule } from 'cdktf';
import { VpcConfig } from './variables';
import { VpcOutputs } from './outputs';

export class VpcConstruct extends Construct implements VpcOutputs {
    public readonly vpcId: string;
    public readonly privateSubnetIds: string[];
    public readonly publicSubnetIds: string[];

    constructor(scope: Construct, name: string, config: VpcConfig) {
        super(scope, name);
    
        // const vpc = new TerraformHclModule(this, 'vpc', {
        //   source: 'terraform-aws-modules/vpc/aws',
        //   version: '5.0.0',
        //   variables: config,
        // });

        const vpc = new TerraformHclModule(this, 'vpc', {
          source: 'terraform-aws-modules/vpc/aws',
          version: '5.0.0',
          variables: {
            name: config.name,
            cidr: config.cidr,
            azs: config.azs,
            private_subnets: config.private_subnets,
            public_subnets: config.public_subnets,
            enable_nat_gateway: config.enable_nat_gateway,
            single_nat_gateway: config.single_nat_gateway,
            enable_dns_hostnames: config.enable_dns_hostnames,
            enable_dns_support: config.enable_dns_support,
            
            // Optional configurations with defaults
            enable_vpn_gateway: false,
            // enable_dns_support: true,
            
            tags: {
              Name: config.name,
              ...config.tags
            }
          },
        });
    
        this.vpcId = vpc.get('vpc_id');
        this.privateSubnetIds = vpc.get('private_subnets');
        this.publicSubnetIds = vpc.get('public_subnets');
      }
}