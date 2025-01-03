// modules/eks/variables.ts
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
  node_security_group_additional_rules?: {
    [key: string]: {
      description?: string;
      protocol: string;
      from_port: number;
      to_port: number;
      type: string;
      cidr_blocks?: string[];
      source_cluster_security_group?: boolean;
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