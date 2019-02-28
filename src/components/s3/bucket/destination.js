/**
 * AWS::S3: Make a destination.
 *
 * @description Make a Destination object.
 * @param {Object} opts - Config/option input.
 * @param {string} opts.arn - * (ARN) of the bucket where analytics results are published. This destination bucket must be in the same region as the bucket used for the analytics or inventory configuration.
 * @param {string} opts.acctId - (BucketAccountId) The ID of the account that owns the destination bucket where the analytics is published.
 * @param {string} [opts.format='CSV'] - (Format) Specifies the output format of the analytics or inventory results. Currently, Amazon S3 supports the comma-separated value (CSV) format.
 * @param {string} opts.prefix - (Prefix) The prefix that is prepended to all analytics results.
 * @see <https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-s3-bucket-destination.html>
 * @returns {Object} Cloduformation object.
 * @example
 *  var dest = destination()
 */
const destination = ({ arn, acctId, format, prefix }) => {
  let Destination = {}
  if (arn) Destination['BucketArn'] = arn
  if (acctId) Destination['BucketAccountId'] = acctId
  if (prefix) Destination['Prefix'] = prefix
  Destination['Format'] = format || 'CSV'
  return { Destination }
}

export { destination }