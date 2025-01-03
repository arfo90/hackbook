// environments/dev/vpc/config.ts
export const config = {
    environment: 'dev',
    project: 'hackbook',
    region: 'us-west-2',
    vpc: {
      name: 'dev-vpc',
      cidr: '10.0.0.0/16',
      azs: ['us-west-2a', 'us-west-2b'],
      private_subnets: ['10.0.1.0/24', '10.0.2.0/24'],
      public_subnets: ['10.0.101.0/24', '10.0.102.0/24'],
      enable_nat_gateway: true,
      single_nat_gateway: true,
      enable_dns_hostnames: true,
      enable_dns_support: true,
      tags: {
        Environment: 'dev',
        Project: 'hackbook'
      }
    }
  };