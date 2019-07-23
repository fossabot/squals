import { IRef, IGetAtt, squals, baseSchemas, genComponentName, validatorGeneric } from '../Template'
import { AppSyncApi } from './api'
import { struct } from 'superstruct'
import { verifyIfThen, ifPathEq, has } from '../../utils/validations/objectCheck'

export class AppSyncResolver implements squals {
  name: string
  Type = 'AWS::AppSync::Resolver'
  Properties: AppSyncResolver_Props

  constructor (i: IAppSyncResolver_min, api?: AppSyncApi) {
    this.name = i.name || genComponentName()
    this.Properties = {
      ApiId: api ? api.ApiId() : i.api ? i.api : '< StillNeedsToBeLinked >',
      Kind: i.kind ? i.kind : 'UNIT',
      FieldName: i.field,
      TypeName: i.type
    }
    if (i.source) this.Properties.DataSourceName = i.source
    if (i.pipelineFns) this.Properties.PipelineConfig = { Functions: i.pipelineFns }
    if (i.reqTempl) this.Properties.RequestMappingTemplate = i.reqTempl
    if (i.reqTemplS3Loc) this.Properties.RequestMappingTemplateS3Location = i.reqTemplS3Loc
    if (i.resTempl) this.Properties.ResponseMappingTemplate = i.resTempl
    if (i.resTemplS3Loc) this.Properties.ResponseMappingTemplateS3Location = i.resTemplS3Loc
  }
  static fromString (i: string): AppSyncResolver {
    return AppSyncResolver.from(JSON.parse(i))
  }
  static fromJSON (i: object): AppSyncResolver {
    return AppSyncResolver.validateJSON(i as AppSyncResolver_json)
  }
  static fromJS (i: object): AppSyncResolver {
    return AppSyncResolver.validateJS(i as IAppSyncResolver_min)
  }
  static from (i: string | object): AppSyncResolver {
    return AppSyncResolver.validate(i)
  }
  static validateJSON (i: AppSyncResolver_json): AppSyncResolver {
    const ref = struct({ Ref: 'string' })
    const getAtt = struct({ 'Fn:GetAtt': struct.tuple(['string', 'string']) })
    const strRef = struct.union(['string', ref])
    const strGetAttRef = struct.union(['string', getAtt, ref])
    struct(
      struct.dict([
        'string',
        struct.interface({
          Type: struct.literal('AWS::AppSync::Resolver'),
          Properties: struct({
            ApiId: strGetAttRef,
            FieldName: strRef,
            TypeName: strRef,
            Kind: struct.optional(struct.enum(['UNIT', 'PIPELINE'])),
            DataSourceName: struct.optional(strRef),
            PipelineConfig: struct.optional({
              Functions: struct([strRef])
            }),
            RequestMappingTemplate: struct.optional(strRef),
            RequestMappingTemplateS3Location: struct.optional(strRef),
            ResponseMappingTemplate: struct.optional(strRef),
            ResponseMappingTemplateS3Location: struct.optional(strRef)
          })
        })
      ])
    )(i)
    const name = Object.keys(i)[0]
    const interdeps = verifyIfThen(ifPathEq('Kind', 'PIPELINE'), has('PipelineConfig.Functions'))
    // add interdeps as a flowRight function - and `verify(ifHas(requestTempl), verifySyntax(string, compileFunction))`
    const props = interdeps(i[name].Properties)
    const ret = new AppSyncResolver({
      field: props.FieldName,
      type: props.TypeName
    })

    ret.Properties = i[name].Properties
    ret.name = name
    return ret
  }
  static validateJS (i: IAppSyncResolver_min): AppSyncResolver {
    const ref = struct({ Ref: 'string' })
    const getAtt = struct({ 'Fn:GetAtt': struct.tuple(['string', 'string']) })
    const strRef = struct.union(['string', ref])
    const strGetAttRef = struct.union(['string', getAtt, ref])
    struct({
      name: 'string?',
      api: struct.optional(strGetAttRef),
      field: strRef,
      type: strRef,
      kind: struct.optional(struct.enum(['UNIT', 'PIPELINE'])),
      source: struct.optional(strRef),
      pipelineFns: struct.optional(struct([strRef])),
      reqTempl: struct.optional(strRef),
      reqTemplS3Loc: struct.optional(strRef),
      resTempl: struct.optional(strRef),
      resTemplS3Loc: struct.optional(strRef)
    })(i)
    const interdep = verifyIfThen(ifPathEq('kind', 'pipeline'), has('pipelineFns'))
    return new AppSyncResolver(interdep(i))
  }
  static validate (i: string | object): AppSyncResolver {
    return validatorGeneric<AppSyncResolver>(i as squals, AppSyncResolver)
  }
  linkDataSource (): AppSyncResolver {
    throw new Error()
    return new AppSyncResolver({ field: '_', type: '_' })
  }

  componentName () {}
  fieldName () {}
  typeName () {}

  toJSON (): object[] {
    return [
      {
        [this.name]: {
          Type: 'AWS::AppSync::Resolver',
          Properties: this.Properties
        }
      } as AppSyncResolver_json
    ]
  }
  Ref (): IRef {
    return { Ref: this.name }
  }
  FieldName (): IGetAtt {
    return { 'Fn::GetAtt': [this.name, 'FieldName'] }
  }
  ResolverArn (): IGetAtt {
    return { 'Fn::GetAtt': [this.name, 'ResolverName'] }
  }
  TypeName (): IGetAtt {
    return { 'Fn::GetAtt': [this.name, 'TypeName'] }
  }
}

export interface IAppSyncResolver_min {
  name?: string
  api?: string | IRef | IGetAtt
  field: string | IRef
  type: string | IRef
  kind?: 'UNIT' | 'PIPELINE'
  source?: string | IRef
  pipelineFns?: (string | IRef)[]
  reqTempl?: string | IRef
  reqTemplS3Loc?: string | IRef
  resTempl?: string | IRef
  resTemplS3Loc?: string | IRef
}

interface AppSyncResolver_json {
  [name: string]: {
    Type: 'AWS::AppSync::Resolver'
    Properties: AppSyncResolver_Props
  }
}

interface AppSyncResolver_Props {
  ApiId: string | IRef | IGetAtt
  FieldName: string | IRef
  TypeName: string | IRef
  Kind?: 'UNIT' | 'PIPELINE'
  DataSourceName?: string | IRef
  PipelineConfig?: {
    Functions: (string | IRef)[]
  }
  RequestMappingTemplate?: string | IRef
  RequestMappingTemplateS3Location?: string | IRef
  ResponseMappingTemplate?: string | IRef
  ResponseMappingTemplateS3Location?: string | IRef
}
