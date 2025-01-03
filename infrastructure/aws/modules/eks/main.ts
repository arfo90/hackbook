// modules/eks/main.ts
import { Construct } from 'constructs';
import { TerraformHclModule } from 'cdktf';
import { EksConfig } from './variables';

export class EksConstruct extends Construct {
  public readonly clusterName!: string;
  public readonly clusterEndpoint!: string;
  public readonly clusterArn!: string;
  public readonly clusterSecurityGroupId!: string;

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
        
        eks_managed_node_groups: config.managed_node_groups,
        
        // Security group rules
        node_security_group_additional_rules: config.node_security_group_additional_rules ?? {
          ingress_http: {
            description: "HTTP ingress",
            protocol: "tcp",
            from_port: 80,
            to_port: 80,
            type: "ingress",
            cidr_blocks: ["0.0.0.0/0"]
          }
        },
        
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