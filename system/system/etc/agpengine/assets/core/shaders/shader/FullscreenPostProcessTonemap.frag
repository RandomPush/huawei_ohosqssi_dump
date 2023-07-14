/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
 * Copyright (c) 2019 The Android Open Source Project
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#version 460 core
#extension GL_ARB_separate_shader_objects : enable
#extension GL_ARB_shading_language_420pack : enable

// specialization

layout(constant_id = 0) const uint CORE_POST_PROCESS_FLAGS = 0;

// includes

#include "core/shaders/common/core_color_conversion_common.h"

#include "core/shaders/common/post_process_common.h"
#include "core/shaders/common/tonemap_common.h"

// sets

layout(set = 0, binding = 0) uniform texture2D uTex;
layout(set = 0, binding = 1) uniform sampler uSampler;

layout(push_constant, std430) uniform uPushConstant
{
    PostProcessTonemapStruct uPC;
};

// in / out

layout (location = 0) in vec2 inUv;

layout (location = 0) out vec4 outColor;

/*
fragment shader for post process and tonemapping
*/
void main(void)
{
    vec4 color = CORE_TEXTURE_2D(sampler2D(uTex, uSampler), inUv);

    if ((CORE_POST_PROCESS_FLAGS & POST_PROCESS_SPECIALIZATION_COLOR_FRINGE_BIT)
        == POST_PROCESS_SPECIALIZATION_COLOR_FRINGE_BIT)
    {
        float chroma = getChromaCoeff(inUv, uPC.colorFringe.y) * uPC.colorFringe.x;

        vec2 uvStep = uPC.texSizeInvTexSize.zw;
        vec2 uvDistToImageCenter = chroma * uvStep;
        float chromaRed = CORE_TEXTURE_2D(sampler2D(uTex, uSampler),
            inUv - vec2(uvDistToImageCenter.x, uvDistToImageCenter.y)).x;
        float chromaBlue = CORE_TEXTURE_2D(sampler2D(uTex, uSampler),
            inUv + vec2(uvDistToImageCenter.x, uvDistToImageCenter.y)).z;

        color.r = chromaRed;
        color.b = chromaBlue;
    }

    if ((CORE_POST_PROCESS_FLAGS & POST_PROCESS_SPECIALIZATION_TONEMAP_BIT)
        == POST_PROCESS_SPECIALIZATION_TONEMAP_BIT)
    {
        const float exposure = uPC.tonemap.x;
        color.rgb = tonemap(color.rgb, exposure, CORE_POST_PROCESS_FLAGS);
    }

    if ((CORE_POST_PROCESS_FLAGS & POST_PROCESS_SPECIALIZATION_VIGNETTE_BIT)
        == POST_PROCESS_SPECIALIZATION_VIGNETTE_BIT)
    {
        const float vignette = getVignetteCoeff(inUv, 40.0 * uPC.vignette.x, uPC.vignette.y);
        color.rgb *= vignette;
    }

    outColor = color;
}
