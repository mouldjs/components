import React, { forwardRef } from 'react'
import * as z from 'zod'
import {
    ComponentPropTypes,
    ParentContextProps,
    ParentContext,
} from '@mouldjs/core/types'
import { RawInput } from './RawInput'
import { ComponentInspector } from '../../app/Inspectors'
import {
    LayoutInspector,
    LayoutPropTypes,
    transformLayout,
} from '@mouldjs/core/inspector/Layout'
import { InputInspector, InputPropTypes } from './Inspector'
import {
    BorderInspector,
    BorderPropTypes,
    transformBorderProps,
} from '@mouldjs/core/inspector/Border'
import { FillInspector, FillPropTypes } from '@mouldjs/core/inspector/Fill'
import { ShadowsInspector, ShadowsPropTypes } from '@mouldjs/core/inspector/Shadows'
import { BlurInspector, BlurPropTypes } from '@mouldjs/core/inspector/Blur'
import {
    FiltersInspector,
    FilterPropTypes,
    FilterType,
} from '@mouldjs/core/inspector/Filters'
import { transformColorToStr } from '@mouldjs/core/inspector/Color'
import { Filter } from '@mouldjs/core/standard/common'
import {
    ContainerLayoutProps,
    ContainerRelatedInspectors,
    getPropsFromParent,
} from '@mouldjs/core/inspector/InspectorProvider'

type InputProps = {
    layoutProps?: LayoutPropTypes
    shadowsProps?: ShadowsPropTypes
    InputProps?: InputPropTypes
    fillProps?: FillPropTypes
    borderProps?: BorderPropTypes
    blurProps?: BlurPropTypes
    filtersProps?: FilterPropTypes
    containerLayoutProps?: ContainerLayoutProps
}

const initialInputProps: InputPropTypes = {
    value: '',
    placeholder: '',
    color: {
        r: 0,
        g: 0,
        b: 0,
        a: 1,
    },
    size: 14,
}

const transformInputProps = (
    InputProps: InputPropTypes = initialInputProps
) => {
    return {
        value: InputProps.value,
        placeholder: InputProps.placeholder,
        color: transformColorToStr(InputProps.color),
        size: InputProps.size + 'px',
    }
}

const transformFilterProps = (
    blurProps?: BlurPropTypes,
    filtersProps?: FilterPropTypes
) => {
    const res: z.infer<typeof Filter> = {}
    if (filtersProps) {
        let filterStr = ''
        Object.keys(filtersProps).forEach((filterType: FilterType) => {
            const filterData = filtersProps[filterType]!
            if (filterData.active) {
                filterStr = `${filterStr} ${filterType
                    .toLowerCase()
                    .split(' ')
                    .join('-')}(${filterData.amount}${filterData.unit})`
            }
        })
        res.filter = filterStr.trim()
    }
    if (blurProps && blurProps.active) {
        const blurStr = `blur(${blurProps.blurAmount}${blurProps.unit})`
        if (blurProps.blurStyle === 'Background') {
            res.backdropFilter = blurStr
        } else {
            res.filter = `${blurStr} ${res.filter || ''}`.trim()
        }
    }

    return res
}

const transformShadowsProps = (shadowsProps: ShadowsPropTypes) => {
    let shadowStr = ''
    shadowsProps.forEach((shadow) => {
        if (shadow.active) {
            shadowStr = `${shadowStr}${shadowStr ? ' ,' : ''}${shadow.x}px ${
                shadow.y
            }px ${shadow.blur}px ${transformColorToStr(shadow.color)}`
        }
    })

    return {
        shadow: shadowStr,
    }
}

export const transform = (
    {
        layoutProps,
        shadowsProps,
        InputProps,
        fillProps,
        borderProps,
        blurProps,
        filtersProps,
        containerLayoutProps = {},
    }: InputProps = {},
    context?: ParentContext
) => {
    let res = {}
    if (fillProps && fillProps.active) {
        res = { ...res, fill: transformColorToStr(fillProps.color) }
    }
    if (borderProps) {
        res = { ...res, ...transformBorderProps(borderProps) }
    }
    return {
        ...res,
        ...transformLayout(layoutProps),
        ...transformInputProps(InputProps!),
        ...(shadowsProps ? transformShadowsProps(shadowsProps) : {}),
        ...transformFilterProps(blurProps, filtersProps),
        ...getPropsFromParent(context, containerLayoutProps),
    }
}

export const Input = forwardRef(
    (
        {
            requestUpdateProps,
            path,
            connectedFields,
            layoutProps,
            shadowsProps,
            InputProps = initialInputProps,
            filtersProps,
            blurProps,
            fillProps,
            borderProps,
            containerLayoutProps = {},
            parent,
            ...rest
        }: ComponentPropTypes & InputProps & ParentContextProps,
        ref
    ) => {
        const props = transform(
            {
                layoutProps,
                shadowsProps,
                InputProps,
                blurProps,
                filtersProps,
                fillProps,
                borderProps,
                containerLayoutProps,
            },
            parent
        )

        return (
            <>
                {requestUpdateProps && path && (
                    <ComponentInspector path={path}>
                        <ContainerRelatedInspectors
                            parent={parent}
                            data={containerLayoutProps || {}}
                            onChange={(data) => {
                                requestUpdateProps({
                                    containerLayoutProps: data,
                                })
                            }}
                        ></ContainerRelatedInspectors>
                        <LayoutInspector
                            title="Layout"
                            data={layoutProps}
                            onChange={(data) =>
                                requestUpdateProps({ layoutProps: data })
                            }
                            connectedFields={connectedFields}
                        ></LayoutInspector>
                        <InputInspector
                            title="Input"
                            data={InputProps}
                            onChange={(data) => {
                                requestUpdateProps({ InputProps: data })
                            }}
                            connectedFields={connectedFields}
                        ></InputInspector>
                        <FillInspector
                            title="Fill"
                            data={fillProps}
                            onChange={(data) => {
                                requestUpdateProps({ fillProps: data })
                            }}
                            connectedFields={connectedFields}
                        ></FillInspector>
                        <BorderInspector
                            data={borderProps}
                            onChange={(data) => {
                                requestUpdateProps({ borderProps: data })
                            }}
                            title="Border"
                            connectedFields={connectedFields}
                        ></BorderInspector>
                        <ShadowsInspector
                            title="Shadows"
                            data={shadowsProps}
                            onChange={(data) =>
                                requestUpdateProps({ shadowsProps: data })
                            }
                            connectedFields={connectedFields}
                            withoutSpread
                        ></ShadowsInspector>
                        <BlurInspector
                            title="Blur"
                            data={blurProps}
                            onChange={(data) => {
                                requestUpdateProps({ blurProps: data })
                            }}
                            connectedFields={connectedFields}
                        ></BlurInspector>
                        <FiltersInspector
                            data={filtersProps}
                            title="Filters"
                            onChange={(data) => {
                                requestUpdateProps({ filtersProps: data })
                            }}
                            connectedFields={connectedFields}
                        ></FiltersInspector>
                    </ComponentInspector>
                )}
                <RawInput ref={ref} {...props} {...rest}></RawInput>
            </>
        )
    }
)
