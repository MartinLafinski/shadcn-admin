import React, { useMemo } from 'react'
import Form, { generateTemplates } from '@rjsf/shadcn'
import {
  type FieldTemplateProps,
  type FormContextType,
  getTemplate,
  getUiOptions,
  type RJSFSchema,
  type StrictRJSFSchema,
} from '@rjsf/utils'
import validator from '@rjsf/validator-ajv8'
import { cn } from '@/lib/utils'
import type { ParamFormData } from '@/features/param-forms/data/schemas'

function FieldTemplate<
  T = any,
  S extends StrictRJSFSchema = RJSFSchema,
  F extends FormContextType = any,
>({
  id,
  children,
  displayLabel,
  rawErrors = [],
  errors,
  help,
  description,
  rawDescription,
  classNames,
  style,
  disabled,
  label,
  hidden,
  onKeyRename,
  onKeyRenameBlur,
  onRemoveProperty,
  readonly,
  required,
  schema,
  uiSchema,
  registry,
}: FieldTemplateProps<T, S, F>) {
  const uiOptions = getUiOptions(uiSchema)
  const WrapIfAdditionalTemplate = getTemplate<
    'WrapIfAdditionalTemplate',
    T,
    S,
    F
  >('WrapIfAdditionalTemplate', registry, uiOptions)
  if (hidden) {
    return <div className='hidden'>{children}</div>
  }
  const isCheckbox = uiOptions.widget === 'checkbox'
  return (
    <WrapIfAdditionalTemplate
      classNames={classNames}
      style={style}
      disabled={disabled}
      id={id}
      label={label}
      displayLabel={displayLabel}
      onKeyRename={onKeyRename}
      onKeyRenameBlur={onKeyRenameBlur}
      onRemoveProperty={onRemoveProperty}
      rawDescription={rawDescription}
      readonly={readonly}
      required={required}
      schema={schema}
      uiSchema={uiSchema}
      registry={registry}
    >
      <div className='flex flex-col gap-2'>
        {displayLabel && !isCheckbox && (
          <label
            className={cn(
              'text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              { 'text-destructive': rawErrors.length > 0 }
            )}
            htmlFor={id}
          >
            {label}
            {required ? (
              <span className='ml-1 font-bold text-red-500'>*</span>
            ) : null}
          </label>
        )}
        {children}
        {displayLabel && rawDescription && !isCheckbox && (
          <span
            className={cn('text-xs font-medium text-muted-foreground', {
              'text-destructive': rawErrors.length > 0,
            })}
          >
            {description}
          </span>
        )}
        {errors}
        {help}
      </div>
    </WrapIfAdditionalTemplate>
  )
}

// function BoldLabelTemplate(props: Record<string, any>) {
//   const {
//     id,
//     label,
//     required,
//     children,
//     errors,
//     help,
//     description,
//     hidden,
//     fieldPathId,
//   } = props
//   const isRoot = fieldPathId?.$id === 'root'
//
//   if (hidden) return <div className='hidden'>{children}</div>
//
//   return (
//     <div className={isRoot ? 'mt-2' : 'mt-4'}>
//       {label &&
//         (isRoot ? (
//           <h5 id={id} className='mb-2 border-b pb-2 text-lg font-bold'>
//             {label}
//             {required && <span className='ml-1 text-destructive'>*</span>}
//           </h5>
//         ) : (
//           <label htmlFor={id} className='mb-1 block text-sm'>
//             {label}
//             {required && <span className='ml-1 text-destructive'>*</span>}
//           </label>
//         ))}
//       {description}
//       {children}
//       {errors}
//       {help}
//     </div>
//   )
// }

// 表单描述模板
// function CustomDescriptionTemplate(props: Record<string, any>) {
//   const { description, id } = props
//   if (!description) return null
//   return (
//     <p id={id} className='mb-4 text-sm text-muted-foreground'>
//       {description}
//     </p>
//   )
// }
//
// function CustomFieldTemplate(props: Record<string, any>) {
//   const { id, label, required, children } = props;
//   return (
//     <div className="space-y-2">
//       <label htmlFor={id} className="text-sm font-medium">
//         {label}
//         {required && <span className="text-red-500 font-bold ml-1">*</span>}
//       </label>
//       {children}
//     </div>
//   );
// }

type ParamFormRendererProps = {
  paramFormData: ParamFormData
  formData: Record<string, unknown>
  onChange: (data: Record<string, unknown>) => void
  disabled?: boolean
  className?: string
}

export function ParamFormRenderer({
  paramFormData,
  formData,
  onChange,
  disabled = false,
  className,
}: ParamFormRendererProps) {
  const { param_json_schema, param_ui_schema } = paramFormData

  const isEmpty =
    !param_json_schema || Object.keys(param_json_schema).length === 0

  const mergedUiSchema = {
    ...(param_ui_schema ?? {}),
    'ui:submitButtonOptions': { norender: true },
  }

  // 暂时不用，别删除
  // const templates = useMemo(() => {
  //   const t = generateTemplates()
  //   const OriginalObjectFieldTemplate = t.ObjectFieldTemplate!
  //
  //   t.ObjectFieldTemplate = (props: Record<string, any>) => {
  //     if (props.fieldPathId?.$id === 'root') {
  //       return (
  //         <>
  //           {props.properties.map(
  //             (
  //               el: { content: React.ReactNode; hidden: boolean },
  //               i: number
  //             ) => (
  //               <div key={i} className={el.hidden ? 'hidden' : ''}>
  //                 {el.content}
  //               </div>
  //             )
  //           )}
  //         </>
  //       )
  //     }
  //     return <OriginalObjectFieldTemplate {...(props as any)} />
  //   }
  //
  //   t.FieldTemplate = CustomFieldTemplate
  //   t.DescriptionFieldTemplate = CustomDescriptionTemplate
  //   return t
  // }, [])

  return (
    <div className={className}>
      {isEmpty ? (
        <p className='text-sm text-muted-foreground'>
          该参数要素包未定义表单结构
        </p>
      ) : (
        <Form
          className='[&_h5]:font-bold'
          tagName='div'
          schema={param_json_schema}
          uiSchema={mergedUiSchema}
          validator={validator}
          formData={formData}
          disabled={disabled}
          // fields={}
          templates={{ FieldTemplate: FieldTemplate }}
          onChange={(e) => onChange(e.formData)}
        />
      )}
    </div>
  )
}
