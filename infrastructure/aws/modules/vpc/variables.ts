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

