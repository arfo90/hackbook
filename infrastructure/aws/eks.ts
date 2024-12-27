import { TerraformHclModule } from 'cdktf';
import { Construct } from 'constructs';

export interface EksConfig {
  cluster_name: string;
  cluster_version: string;
  vpc_id: string;
  subnet_ids: string[];
  cluster_endpoint_private_access?: boolean;
  cluster_endpoint_public_access?: boolean;
  managed_node_groups?: {
    [key: string]: {
      name: string;
      instance_types: string[];
      min_size: number;
      max_size: number;
      desired_size: number;
      capacity_type?: 'ON_DEMAND' | 'SPOT';
      labels?: { [key: string]: string };
    };
  };
  fargate_profiles?: {
    [key: string]: {
      name: string;
      selectors: {
        namespace: string;
        labels?: { [key: string]: string };
      }[];
    };
  };
  tags?: { [key: string]: string };
}

export class EksConstruct extends Construct {
  public readonly clusterName: string;
  public readonly clusterEndpoint: string;
  public readonly clusterArn: string;
  public readonly clusterSecurityGroupId: string;

  constructor(scope: Construct, name: string, config: EksConfig) {
    super(scope, name);

    const eks = new TerraformHclModule(this, 'eks', {
      source: 'terraform-aws-modules/eks/aws',
      version: '19.15.3',
      variables: {
        cluster_name: config.cluster_name,
        cluster_version: config.cluster_version,
        vpc_id: config.vpc_id,
        subnet_ids: config.subnet_ids,
        
        cluster_endpoint_public_access: config.cluster_endpoint_public_access ?? true,
        cluster_endpoint_private_access: config.cluster_endpoint_private_access ?? true,
        
        // Changed from managed_node_groups to eks_managed_node_groups
        eks_managed_node_groups: config.managed_node_groups,
        
        fargate_profiles: config.fargate_profiles,

        manage_aws_auth_configmap: false,
        create_aws_auth_configmap: false,
        
        enable_irsa: true,
        cluster_enabled_log_types: ["api", "audit", "authenticator"],
        
        tags: config.tags ?? {}
      },
    });

    this.clusterName = eks.get('cluster_name');
    this.clusterEndpoint = eks.get('cluster_endpoint');
    this.clusterArn = eks.get('cluster_arn');
    this.clusterSecurityGroupId = eks.get('cluster_security_group_id');
  }
}