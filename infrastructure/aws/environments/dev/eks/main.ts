// environments/dev/eks/main.ts
import { Construct } from 'constructs';
import { App, TerraformStack, TerraformOutput, S3Backend, DataTerraformRemoteStateS3 } from 'cdktf';
import { AwsProvider } from '@cdktf/provider-aws/lib/provider';
import { EksConstruct } from '../../../modules/eks/main';
import { config } from '../config';

class DevEksStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Configure S3 Backend
    new S3Backend(this, {
      bucket: `${config.project}-${config.environment}-terraform-state`,
      key: "eks/terraform.tfstate",
      region: config.region,
      dynamodbTable: `${config.project}-${config.environment}-terraform-locks`
    });
    

    new AwsProvider(this, 'aws', {
      region: config.region
    });

    // Get VPC outputs from remote state
    const vpcState = new DataTerraformRemoteStateS3(this, 'vpc', {
        bucket: `${config.project}-${config.environment}-terraform-state`,
        key: "vpc/terraform.tfstate",
        region: config.region
    });

    const eks = new EksConstruct(this, 'eks', {
      cluster_name: `${config.project}-${config.environment}-eks`,
      cluster_version: config.eks.version,
      vpc_id: vpcState.getString('vpc_id'),
      subnet_ids: vpcState.getList('private_subnet_ids').map(id => id.toString()),
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
          instance_types: config.eks.managed_node_groups.spot.instance_types,
          min_size: config.eks.managed_node_groups.spot.scaling.min,
          max_size: config.eks.managed_node_groups.spot.scaling.max,
          desired_size: config.eks.managed_node_groups.spot.scaling.desired,
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
      
      tags: {
        Environment: config.environment,
        Project: config.project,
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
  }
}

const app = new App();
new DevEksStack(app, 'dev-eks');
app.synth();
