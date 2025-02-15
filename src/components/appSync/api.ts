import { IRef, IGetAtt, squals, ITags, Itags, tags, validatorGeneric } from '../Template'
import {
  AppSyncResolver,
  AppSyncFuncConfig,
  AppSyncDataSource,
  AppSyncSchema,
  AppSyncApiKey,
  IAppSyncApiKey_min,
  IAppSyncFuncConfig_min,
  IAppSyncDataSource_min,
  IAppSyncResolver_min,
  IAppSyncSchema_min
} from '.'
import { flowRight } from 'lodash-es'
import { struct } from 'superstruct'
import { verifyIfThen, ifPathEq, has } from '../../utils/validations/objectCheck'
// import { AppSync } from 'aws-sdk'

export class AppSyncApi implements squals {
  name: string
  Type = 'AWS::AppSync::GraphQLApi'
  Properties: IAppSyncApi_props
  _linked = {
    keys: [] as AppSyncApiKey[],
    resovlers: [] as AppSyncResolver[],
    configs: [] as AppSyncFuncConfig[],
    sources: [] as AppSyncDataSource[],
    schemas: [] as AppSyncSchema[]
  }
  /**
   * Create new progamatic representations of a GraphQL Api.
   *
   */
  constructor (i: IGraphQLapi_min) {
    this.name = i.name
    this.Properties = { Name: i.name, AuthenticationType: i.authType || 'API_KEY' }
    if (i.logs) {
      this.Properties.LogConfig = {
        CloudWatchLogsRoleArn: i.logs.roleArn,
        FieldLogLevel: i.logs.level
      }
    }
    if (i.openId) {
      this.Properties.OpenIDConnectConfig = {
        AuthTTL: i.openId.authTTLms,
        ClientId: i.openId.clientId,
        IatTTL: i.openId.iatTTLms,
        Issuer: i.openId.issuer
      }
    }
    if (i.pool) {
      this.Properties.UserPoolConfig = {
        UserPoolId: i.pool.id,
        AppIdClientRegex: i.pool.clientIdRegex,
        AwsRegion: i.pool.region,
        DefaultAction: i.pool.defaultAction || 'ALLOW'
      }
    }
    if (i.additional) {
      this.Properties.AdditionalAuthenticationProviders = []
    }
  }

  static from (i: string | object): AppSyncApi {
    return AppSyncApi.validate(i)
  }

  static fromJS (i: object): AppSyncApi {
    return AppSyncApi.validateJS(i as IGraphQLapi_min)
  }

  static fromString (i: string): AppSyncApi {
    const inputObj = JSON.parse(i)
    return AppSyncApi.from(inputObj)
  }

  static fromJSON (i: object): AppSyncApi {
    return AppSyncApi.validateJSON(i as IAppSyncApi_json)
  }

  /* istanbul ignore next */
  private static fromSDK (i: any): AppSyncApi {
    // make public post implementation
    throw new Error('not implemented yet')
  }

  static validateJSON (i: object): AppSyncApi {
    // #region schema segments
    const ref = struct({ Ref: 'string' })
    const getAtt = struct({ 'Fn:GetAtt': struct.tuple(['string', 'string']) })
    const strGetAttRef = struct(struct.union(['string', getAtt, ref]))

    const cognitoPool = struct({
      AppIdClientRegex: 'string',
      AwsRegion: 'string',
      UserPoolId: 'string'
    })

    const userPool = struct.intersection([
      cognitoPool,
      struct({
        DefaultAction: struct.enum(['DENY, ALLOW'])
      })
    ])

    const openID = struct({
      AuthTTL: 'number',
      ClientId: 'string',
      IatTTL: 'number',
      Issuer: 'string'
    })

    const additionalProviderItem = struct({
      AuthenticationType: struct.enum([
        'API_KEY',
        'AWS_IAM',
        'OPENID_CONNECT',
        'AMAZON_COGNITO_USER_POOLS'
      ]),
      OpenIDConnectConfig: struct.optional(openID),
      UserPoolConfig: struct.optional(cognitoPool)
    })
    // #endregion schema segments

    struct(
      struct.dict([
        'string',
        struct({
          Type: struct.literal('AWS::AppSync::GraphQLApi'),
          Properties: struct({
            Name: strGetAttRef,
            AuthenticationType: struct.enum([
              'API_KEY',
              'AWS_IAM',
              'OPENID_CONNECT',
              'AMAZON_COGNITO_USER_POOLS'
            ]),
            AdditionalAuthenticationProviders: struct([additionalProviderItem]),
            LogConfig: struct.optional(struct({ a: 1 })),
            OpenIDConnectConfig: struct.optional(openID),
            Tags: struct.optional([struct.dict(['string', 'string'])]),
            UserPoolConfig: struct.optional(userPool)
          })
        })
      ])
    )(i)

    const verifyInterDeps = flowRight(
      verifyIfThen(ifPathEq('AuthenticationType', 'OPENID_CONNECT'), has('OpenIDConnectConfig')),
      verifyIfThen(
        ifPathEq('AuthenticationType', 'AMAZON_COGNITO_USER_POOLS'),
        has('UserPoolConfig')
      )
    )

    // validation failures throws errors
    // returns validated input on pass
    const ret = new AppSyncApi({ name: '' })
    const o = i as IAppSyncApi_json
    ret.name = Object.keys(o)[0]
    ret.Properties = o[ret.name].Properties
    verifyInterDeps(o[ret.name].Properties)

    if (ret.Properties.AdditionalAuthenticationProviders) {
      ret.Properties.AdditionalAuthenticationProviders.map(prov => verifyInterDeps(prov))
    }

    return ret
  }

  static validateJS (i: object): AppSyncApi {
    const ref = struct({ Ref: 'string' })
    const getAtt = struct({ 'Fn:GetAtt': struct.tuple(['string', 'string']) })
    const strGetAttRef = struct(struct.union(['string', getAtt, ref]))
    const listOfDicts = struct([struct.dict(['string', 'string'])])

    const _cognitoPool = struct.interface({
      id: 'string',
      region: 'string',
      clientIdRegex: 'string?'
    })

    const _userpool = struct.interface(
      struct.intersection([_cognitoPool, struct({ defaultAction: struct.enum(['ALLOW', 'DENY']) })])
    )

    const _openIdSchema = struct.interface({
      issuer: struct.optional(strGetAttRef),
      clientId: struct.optional(strGetAttRef),
      authTTLms: struct.optional(strGetAttRef),
      iatTTLms: struct.optional(strGetAttRef)
    })

    struct(
      struct.interface({
        name: 'string',
        authType: struct.enum([
          'API_KEY',
          'AWS_IAM',
          'OPENID_CONNECT',
          'AMAZON_COGNITO_USER_POOLS'
        ]),
        logs: struct({
          level: struct.enum(['NONE', 'ERROR', 'ALL']),
          roleArn: strGetAttRef
        }),
        openId: struct.optional(_openIdSchema),
        tags: struct.optional(listOfDicts),
        pool: struct.optional(_userpool),
        additional: struct.optional(
          struct({
            authType: struct.enum([
              'API_KEY',
              'AWS_IAM',
              'OPENID_CONNECT',
              'AMAZON_COGNITO_USER_POOLS'
            ]),
            openId: struct.optional(_openIdSchema),
            pool: struct.optional(_cognitoPool)
          })
        )
      })
    )(i)

    return new AppSyncApi(i as IGraphQLapi_min)
  }

  static validate (i: string | object): AppSyncApi {
    return validatorGeneric<AppSyncApi>(i as squals, AppSyncApi)
  }

  withRelated (...i: object[]): AppSyncApi {
    throw new Error('not implemented yet')
  }

  logConfig (i: {
  roleArn: string | IRef | IGetAtt
  level: 'NONE' | 'ERROR' | 'ALL' | IRef | IGetAtt
  }): AppSyncApi {
    this.Properties.LogConfig = {
      CloudWatchLogsRoleArn: i.roleArn,
      FieldLogLevel: i.level
    }
    return this
  }

  defaultAuthUses (
    authDescr?: 'API_KEY' | 'AWS_IAM',
    authConfig?: IGraphQLapi_openId | IGraphQLapi_userPool
  ): AppSyncApi {
    if (authConfig) {
      if ('issuer' in authConfig) {
        // open ID
        this.Properties.AuthenticationType = 'OPENID_CONNECT'
        this.Properties.OpenIDConnectConfig = {
          AuthTTL: authConfig.authTTLms,
          ClientId: authConfig.clientId,
          IatTTL: authConfig.iatTTLms,
          Issuer: authConfig.issuer
        }
      } else {
        // cognito
        this.Properties.AuthenticationType = 'AMAZON_COGNITO_USER_POOLS'
        this.Properties.UserPoolConfig = {
          UserPoolId: authConfig.id,
          AppIdClientRegex: authConfig.clientIdRegex,
          AwsRegion: authConfig.region,
          DefaultAction: authConfig.defaultAction
        }
      }
    } else {
      if (authDescr) {
        // strings
        this.Properties.AuthenticationType = authDescr
      } else {
        // default
        this.Properties.AuthenticationType = 'API_KEY'
      }
    }
    return this
  }

  openIdConnection (): AppSyncApi {
    return this
  }

  moreAuthProviders (...p: IGraphQL_authProviders[]): AppSyncApi {
    this.Properties.AdditionalAuthenticationProviders = p.map(v => {
      switch (v.authType) {
        case 'AMAZON_COGNITO_USER_POOLS':
          return {
            AuthenticationType: v.authType,
            UserPoolConfig: {
              UserPoolId: v.pool.id,
              AwsRegion: v.pool.region,
              AppIdClientRegex: v.pool.clientIdRegex
            },
            OpenIDConnectConfig: undefined
          }
        case 'OPENID_CONNECT':
          return {
            AuthenticationType: v.authType,
            UserPoolConfig: undefined,
            OpenIDConnectConfig: {
              AuthTTL: v.openId.authTTLms,
              ClientId: v.openId.clientId,
              IatTTL: v.openId.iatTTLms,
              Issuer: v.openId.issuer
            }
          }
        case 'API_KEY':
          return {
            AuthenticationType: v.authType,
            UserPoolConfig: undefined,
            OpenIDConnectConfig: undefined
          }
        case 'AWS_IAM':
          return {
            AuthenticationType: v.authType,
            UserPoolConfig: undefined,
            OpenIDConnectConfig: undefined
          }
      }
    })
    return this
  }

  userPoolConfig (): AppSyncApi {
    return this
  }

  linkDataSouces (...d: (IAppSyncDataSource_min | AppSyncDataSource)[]) {
    this._linked.sources = d.map(dataSrc => {
      const ds = dataSrc instanceof AppSyncDataSource ? dataSrc : new AppSyncDataSource(dataSrc)
      ds.Properties.ApiId = this.ApiId()
      return ds
    })
    return this
  }

  linkFunctionConfigs (...c: (IAppSyncFuncConfig_min | AppSyncFuncConfig)[]): AppSyncApi {
    this._linked.configs = c.map(funcConfg => {
      const f =
        funcConfg instanceof AppSyncFuncConfig ? funcConfg : new AppSyncFuncConfig(funcConfg)
      f.Properties.ApiId = this.ApiId()
      return f
    })
    return this
  }

  linkApiKeys (...i: (IAppSyncApiKey_min | AppSyncApiKey)[]): AppSyncApi {
    this._linked.keys = i.map(key => {
      const k = key instanceof AppSyncApiKey ? key : new AppSyncApiKey(key)
      k.Properties.ApiId = this.ApiId()
      return k
    })
    return this
  }

  linkeResolvers (...r: (IAppSyncResolver_min | AppSyncResolver)[]): AppSyncApi {
    this._linked.resovlers = r.map(reslv => {
      const rez = reslv instanceof AppSyncResolver ? reslv : new AppSyncResolver(reslv)
      rez.Properties.ApiId = this.ApiId()
      return rez
    })
    return this
  }

  linkSchemas (...s: (IAppSyncSchema_min | AppSyncSchema)[]): AppSyncApi {
    this._linked.schemas = s.map(schema => {
      const rez = schema instanceof AppSyncSchema ? schema : new AppSyncSchema(schema)
      rez.Properties.ApiId = this.ApiId()
      return rez
    })
    return this
  }

  tags (...t: Itags[]): AppSyncApi {
    this.Properties.Tags = tags(t)
    return this
  }

  toJSON (withRelated: boolean = false): object[] {
    return withRelated
      ? [
          ({
            [this.name]: {
              Type: 'AWS::AppSync::GraphQLApi',
              Properties: this.Properties
            }
          } as unknown) as JSON,
          ...((this._linked.resovlers.map(v => v.toJSON()) as unknown) as JSON[]),
          ...((this._linked.configs.map(v => v.toJSON()) as unknown) as JSON[]),
          ...((this._linked.sources.map(v => v.toJSON()) as unknown) as JSON[]),
          ...((this._linked.schemas.map(v => v.toJSON()) as unknown) as JSON[])
      ]
      : [
        {
          [this.name]: {
            Type: 'AWS::AppSync::GraphQLApi',
            Properties: this.Properties
          }
        }
      ]
  }
  Ref (): IRef {
    return { Ref: this.name }
  }
  ApiId (): IGetAtt {
    return { 'Fn::GetAtt': [this.name, 'ApiId'] }
  }
  Arn (): IGetAtt {
    return { 'Fn::GetAtt': [this.name, 'Arn'] }
  }
  GraphQLUrl (): IGetAtt {
    return { 'Fn::GetAtt': [this.name, 'GraphQLUrl'] }
  }
}

// #region internal_interfaces

interface IGraphQLapi_min {
  name: string // doubles with internal use to
  authType?: 'API_KEY' | 'AWS_IAM' | 'OPENID_CONNECT' | 'AMAZON_COGNITO_USER_POOLS'
  logs?: {
    level: 'NONE' | 'ERROR' | 'ALL'
    roleArn: string | IRef | IGetAtt
  }
  openId?: IGraphQLapi_openId
  pool?: IGraphQLapi_userPool
  additional?: IGraphQL_authProviders[]
  tags?: Itags[]
}

interface IGraphQLapi_cognitoPool {
  id: string
  region: string
  clientIdRegex?: string
}

type IGraphQLapi_userPool = IGraphQLapi_cognitoPool & { defaultAction: 'ALLOW' | 'DENY' }

interface IGraphQLapi_openId {
  issuer: string | IRef | IGetAtt
  clientId?: string | IRef | IGetAtt
  authTTLms?: number | IRef | IGetAtt
  iatTTLms?: number | IRef | IGetAtt
}

type IGraphQL_authProviders =
  | { authType: 'API_KEY' }
  | { authType: 'AWS_IAM' }
  | IGraphQL_authProviders_openID
  | IGraphQL_authProviders_cognito

interface IGraphQL_authProviders_openID {
  authType: 'OPENID_CONNECT'
  openId: IGraphQLapi_openId
}

interface IGraphQL_authProviders_cognito {
  authType: 'AMAZON_COGNITO_USER_POOLS'
  pool: IGraphQLapi_cognitoPool
}

export interface IAppSyncApi_props {
  Name: string | IRef | IGetAtt
  AuthenticationType: 'API_KEY' | 'AWS_IAM' | 'OPENID_CONNECT' | 'AMAZON_COGNITO_USER_POOLS'
  AdditionalAuthenticationProviders?: IGraphQL_AddlAuthProv[]
  LogConfig?: {
    CloudWatchLogsRoleArn: string | IRef | IGetAtt
    FieldLogLevel: 'NONE' | 'ERROR' | 'ALL' | IRef | IGetAtt
  }
  OpenIDConnectConfig?: IGraphQL_OpenIDConnect
  UserPoolConfig?: IGraphQL_UserPoolConfig
  Tags?: ITags[]
}

interface IGraphQL_AddlAuthProv {
  AuthenticationType: 'API_KEY' | 'AWS_IAM' | 'OPENID_CONNECT' | 'AMAZON_COGNITO_USER_POOLS'
  OpenIDConnectConfig?: IGraphQL_OpenIDConnect
  UserPoolConfig?: IGraphQL_CognitoPool
}

interface IGraphQL_CognitoPool {
  AppIdClientRegex?: string | IRef | IGetAtt
  AwsRegion?: string | IRef | IGetAtt
  UserPoolId?: string | IRef | IGetAtt
}

type IGraphQL_UserPoolConfig = IGraphQL_CognitoPool & {
  DefaultAction: 'ALLOW' | 'DENY'
}

interface IGraphQL_OpenIDConnect {
  AuthTTL?: number | IRef | IGetAtt
  ClientId?: string | IRef | IGetAtt
  IatTTL?: number | IRef | IGetAtt
  Issuer?: string | IRef | IGetAtt
}

export interface IAppSyncApi_json {
  [name: string]: {
    Type: 'AWS::AppSync::GraphQLApi'
    Properties: IAppSyncApi_props
  }
}
// #endregion internal_interfaces
