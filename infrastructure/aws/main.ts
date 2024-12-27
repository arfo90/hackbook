import { Construct } from 'constructs';
import { App, TerraformStack, TerraformOutput } from 'cdktf';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { VpcConstruct } from './vpc';
import { EksConstruct } from './eks';

interface StackConfig {
  environment: string;
  project: string;
  region: string;
  vpc: {
    cidr: string;
    azs: string[];
    private_subnets: string[];
    public_subnets: string[];
  };
  eks: {
    version: string;
    managed_node_groups: {
      spot: {
        instance_types: string[];
        scaling: {
          min: number;
          max: number;
          desired: number;
        };
      };
      ondemand: {
        instance_types: string[];
        scaling: {
          min: number;
          max: number;
          desired: number;
        };
      };
    };
  };
}

class MyStack extends TerraformStack {
  constructor(scope: Construct, name: string, config: StackConfig) {
    super(scope, name);

    new AwsProvider(this, 'aws', {
      region: config.region
    });

    const vpc = new VpcConstruct(this, 'vpc', {
      name: `${config.project}-${config.environment}-vpc`,
      cidr: config.vpc.cidr,
      azs: config.vpc.azs,
      private_subnets: config.vpc.private_subnets,
      public_subnets: config.vpc.public_subnets,
      enable_nat_gateway: true,
      single_nat_gateway: true,
      enable_dns_hostnames: true,
      enable_dns_support: true,
      tags: {
        Environment: config.environment,
        Project: config.project,
        ManagedBy: 'terraform'
      }
    });

    const eks = new EksConstruct(this, 'eks', {
      cluster_name: `${config.project}-${config.environment}-eks`,
      cluster_version: config.eks.version,
      vpc_id: vpc.vpcId,
      subnet_ids: vpc.privateSubnetIds,
      cluster_endpoint_private_access: true,
      cluster_endpoint_public_access: true,

      managed_node_groups: {
        general: {
          name: "general-workload",
          instance_types: ["t3.medium"],
          min_size: 1,
          max_size: 3,
          desired_size: 2,
          capacity_type: "ON_DEMAND",
          labels: { "workload-type": "general" }
        },
        spot: {
          name: "spot-workload",
          instance_types: ["t3.medium", "t3.large"],
          min_size: 0,
          max_size: 5,
          desired_size: 1,
          capacity_type: "SPOT",
          labels: { "workload-type": "spot" }
        }
      },
      
      fargate_profiles: {
        system: {
          name: "system",
          selectors: [
            { namespace: "kube-system" },
            { namespace: "kubernetes-dashboard" }
          ]
        }
      },

      // cluster_addons: {
      //   coredns: { most_recent: true },
      //   vpc_cni: { most_recent: true },
      //   aws_ebs_csi_driver: { most_recent: true }
      // },
      
      tags: {
        Environment: "dev",
        Team: "platform"
      }
  
    });

    new TerraformOutput(this, 'cluster_endpoint', {
      value: eks.clusterEndpoint,
      description: 'EKS cluster endpoint'
    });

    new TerraformOutput(this, 'cluster_name', {
      value: eks.clusterName,
      description: 'EKS cluster name'
    });

    new TerraformOutput(this, 'vpc_id', {
      value: vpc.vpcId,
      description: 'VPC ID'
    });

    new TerraformOutput(this, 'private_subnet_ids', {
      value: vpc.privateSubnetIds,
      description: 'Private subnet IDs'
    });
  }
}

const config: StackConfig = {
  environment: 'dev',
  project: 'myproject',
  region: 'us-west-2',
  vpc: {
    cidr: '10.0.0.0/16',
    azs: ['us-west-2a', 'us-west-2b'],
    private_subnets: ['10.0.1.0/24', '10.0.2.0/24'],
    public_subnets: ['10.0.101.0/24', '10.0.102.0/24']
  },
  eks: {
    version: '1.27',
    managed_node_groups: {
      spot: {
        instance_types: ['t3.medium', 't3.large'],
        scaling: { min: 1, max: 5, desired: 2 }
      },
      ondemand: {
        instance_types: ['t3.medium'],
        scaling: { min: 1, max: 3, desired: 2 }
      }
    }
  }
};

const app = new App();
new MyStack(app, 'aws-infrastructure', config);
app.synth();