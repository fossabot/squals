/* eslint no-unused-vars: ["error", { "args": "none" }] */
import { isEmpty, intersection } from 'lodash-es'
import { OutTags } from './tags.js'
import { OutVersioning } from './versioningConfiguration.js'
// import { OutAccelerateConfig } from './accelerateConfiguration'
import { OutAnalyticsItem } from './analyticsConfiguration'
import { OutServerSideEncRule } from './bucketEncryption'
import { OutCorsRule } from './corsConfiguration'
import { OutInventoryRule } from './inventoryConfiguration'
import { OutLifecycleRule } from './lifecycleConfiguration'
import { OutLogging } from './loggingConfiguration'
import { OutMetricsRule } from './metricsConfiguration'
import { OutSeparatedNotificationSets } from './notificationConfiguration'
import { OutPublicAccessConfig } from './publicAccessBlockConfiguration'
import { OutReplicationRule } from './replicationConfiguration'
import { OutWebsiteConfigElem, inWebsiteConfig } from './websiteConfiguration'
import randomWord from 'random-word'
import Randoma from 'randoma'

/*
 * @todo Need a way to bootstrap an S3Bucket Object based on existin template.
 *  - based on string
 *  - based on file buffer?
 *  - based on URL?
 *  - based on S3 location?
 *
 * All of the above make it more useful to update my tamplates once they are already out there...
 * Once I go with autoGen'd logical-names I have to stick with them, so that creates a point of great utility.
 *
 */

export class S3Bucket {
  name: string
  Type: 'AWS::S3::Bucket'
  Properties?: {
    BucketName?: string
    AccessControl?:
      | 'AuthenticatedRead'
      | 'AwsExecRead'
      | 'BucketOwnerRead'
      | 'BucketOwnerFullControl'
      | 'LogDeliveryWrite'
      | 'Private'
      | 'PublicRead'
      | 'PublicReadWrite'
    AccelerateConfiguration?: { AccelerationStatus: 'Enabled' | 'Suspended' }
    AnalyticsConfigurations?: OutAnalyticsItem[]
    BucketEncryption?: { ServerSideEncryptionConfiguration: OutServerSideEncRule[] }
    CorsConfiguration?: { CorsRules: OutCorsRule[] }
    InventoryConfigurations?: OutInventoryRule[]
    LifecycleConfiguration?: { Rules: OutLifecycleRule[] }
    LoggingConfiguration?: OutLogging
    MetricsConfigurations?: OutMetricsRule[]
    NotificationConfiguration?: OutSeparatedNotificationSets
    PublicAccessBlockConfiguration?: OutPublicAccessConfig
    ReplicationConfiguration?: {
      Role: string
      Rules: OutReplicationRule[]
    }
    Tags?: OutTags
    VersioningConfiguration?: OutVersioning
    WebsiteConfiguration?: OutWebsiteConfigElem
  }
  private properties = [
    'BucketName',
    'AccessControl',
    'AccelerateConfiguration',
    'AnalyticsConfiguration',
    'BucketEncryption',
    'CorsConfiguration',
    'InventoryConfiguration',
    'LifecycleConfiguration',
    'LoggingConfiguration',
    'MetricsConfiguration',
    'NotificationConfiguration',
    'PublicAccessBlockConfiguration',
    'ReplicationConfiguration',
    'Tags',
    'VersioningConfiguration',
    'WebsiteConfiguration'
  ]

  private bucketACLS = [
    'AuthenticatedRead',
    'AwsExecRead',
    'BucketOwnerRead',
    'BucketOwnerFullControl',
    'LogDeliveryWrite',
    'Private',
    'PublicRead',
    'PublicReadWrite'
  ]

  /**
   * S3Bucket Class that models info needed for Cloudformation.
   *
   * @description S3 Object maker
   * @example
   *  // #! node myExample.js
   *  var ImportESM = require('esm')(module)
   *  var S3Bucket = ImportESM('./src/s3/bucket.js')
   *  var myBucket = new S3Bucket()
   *  console.log({myBucket})
   */
  constructor (props: IInS3Bucket = {}, name: string = '') {
    this.Type = 'AWS::S3::Bucket'
    this.name =
      name.length > 0
        ? name
        : `arn:aws:s3:::${randomWord()}-${randomWord()}-${new Randoma({
          seed: new Date().getTime()
        }).integer()}`

    this.Properties = { ...props }
  }

  toJSON () {
    if (this.Properties) {
      const printable = Object.entries(this.Properties).reduce((a: any, [k, v]) => {
        if (v && !isEmpty(v)) a[k] = v
        return a
      }, {})
      return {
        [this.name]: {
          Type: this.Type,
          Properties: { ...printable }
        }
      }
    } else {
      return {
        [this.name]: {
          Type: this.Type
        }
      }
    }
  }

  website (config: boolean | inWebsiteConfig): S3Bucket {
    if (config) {
      const AccessControl = 'PublicRead'
      const WebsiteConfiguration = {
        IndexDocument: 'index.html',
        ErrorDocument: '404.html'
      }
      this.Properties = {
        ...this.Properties,
        AccessControl,
        WebsiteConfiguration
      }

      // use RedirectAllRequestsTo XOR RoutingRules

      if (typeof config !== 'boolean' && 'redir' in config) {
        const { redir } = config
        if (Array.isArray(redir)) {
          // got redir rules
        } else {
          const r = redir as string
          // setup the redir all to `r`
        }
      }
    } else {
      if (this.Properties) delete this.Properties.WebsiteConfiguration
    }
    return this
  }
  Ref () {
    /**
     * When the logical ID of this resource is provided to the Ref intrinsic function,
     * Ref returns the resource name.
     * Example: mystack-mybucket-kdwwxmddtr2g.
     * */
    return { Ref: this.name }
  }

  Arn () {
    /**
     * Returns the Amazon Resource Name (ARN) of the specified bucket.
     * Example: arn:aws:s3:::mybucket
     * */
    return { 'Fn::GetAtt': [this.name, 'Arn'] }
  }

  DomainName () {
    /**
     * Returns the IPv4 DNS name of the specified bucket.
     * Example: mystack-mybucket-kdwwxmddtr2g.s3.amazonaws.com
     * Or with a `DualStackDomainName` it returns the IPv6 DNS name of the specified bucket.
     *
     * Example: mystack-mybucket-kdwwxmddtr2g.s3.dualstack.us-east-2.amazonaws.com
     */
    return { 'Fn::GetAtt': [this.name, 'DomainName'] }
  }

  RegionalDomainName () {
    /**
     * Returns the regional domain name of the specified bucket
     * Example: mystack-mybucket-kdwwxmddtr2g.s3.us-east-2.amazonaws.com
     */

    return { 'Fn::GetAtt': [this.name, 'RegionalDomainName'] }
  }

  WebsiteURL () {
    /**
     * Returns the Amazon S3 website endpoint for the specified bucket.
     * Example (IPv4): http://mystack-mybucket-kdwwxmddtr2g.s3-website-us-east-2.amazonaws.com/
     * Example (IPv6): http://mystack-mybucket-kdwwxmddtr2g.s3.dualstack.us-east-2.amazonaws.com/
     */
    return { 'Fn::GetAtt': [this.name, 'WebsiteURL'] }
  }

  outputs (existingOutputs: any) {
    return {
      ...existingOutputs,
      [`${this.name}-websiteURL`]: {
        Description: 'The WebsiteURL of the S3Bucket',
        Value: this.WebsiteURL()
      }
    }
  }

  // validate () {
  //   const testStatusBuilder = (passing = true, msgAccum = {}) => {
  //     return (pass, addMsg) => {
  //       msgAccum = pass ? { ...msgAccum } : { ...msgAccum, ...addMsg }
  //       passing = passing && pass
  //       return {
  //         test: pass,
  //         allTestsPass: passing,
  //         failMsgs: msgAccum
  //       }
  //     }
  //   }
  //   const didTestPass = testStatusBuilder()

  //   // @ts-ignore
  //   const { allTestsPass, failMsgs } = validations(this).reduce((p, t) => {
  //     return didTestPass(t.test, t.msg)
  //   })
  //   return { passes: allTestsPass, failMsgs }
  // }
}

interface IInS3Bucket {}
interface IRef {
  Ref: string
}
interface IGetAtt {
  'Fn::GetAtt': [string, string]
}
interface IValidation {
  passes: boolean
  failMsgs: string
}