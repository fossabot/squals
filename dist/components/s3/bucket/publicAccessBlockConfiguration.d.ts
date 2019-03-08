/** @module S3Bucket */
/**
 * Public Access Condfig.
 *
 * @description specifies the public access configuration for an Amazon S3 bucket.
 * @param param - Object with 4 valid key/properties.
 * @param param.publicAclBlock  - Should S3 reject public ACLs for this bucket.
 * @param param.pulicAclIgnore  - Should S3 ignore public ACLs for this bucket.
 * @param param.publicPolciy  - Should S3 block public bucket policies for this bucket.
 * @param param.publicBuckets  - Should S3 lock down public bucket policies for this bucket.
 * @todo add defaults to this function
 * @see <https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-publicaccessblockconfiguration.html>

 * @example
 *  var a = publicAccesConfig({publicAclBlock: true,  pulicAclIgnore:true, publicPolciy:true, publicBuckets:true})
 */
export declare const publicAccesConfig: (params: InPublicAccessConfig) => {
    PublicAccessBlockConfiguration: OutPublicAccessConfig;
};
export interface InPublicAccessConfig {
    publicAclBlock: boolean;
    pulicAclIgnore: boolean;
    publicPolciy: boolean;
    publicBuckets: boolean;
}
export interface OutPublicAccessConfig {
    BlockPublicAcls?: boolean;
    BlockPublicPolicy?: boolean;
    IgnorePublicAcls?: boolean;
    RestrictPublicBuckets?: boolean;
}
//# sourceMappingURL=publicAccessBlockConfiguration.d.ts.map