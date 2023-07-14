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

// includes
#include "core/shaders/common/core_compatibility_common.h"

// sets

struct ImguiPushConstantStruct
{
    vec4 scaleTranslate; // .xy = scale, .zw = translate
};

layout(push_constant, std430) uniform uPushConstant
{
    ImguiPushConstantStruct uPc;
};

// in / out

layout(location = 0) in vec2 inPosition;
layout(location = 1) in vec2 inUv;
layout(location = 2) in vec4 inColor;

layout(location = 0) out vec4 outColor;
layout(location = 1) out vec2 outUv;

/*
vertex shader for imgui
*/
void main(void)
{
    outUv = inUv;
    outColor = inColor;
    CORE_VERTEX_OUT(vec4(inPosition.xy * uPc.scaleTranslate.xy + uPc.scaleTranslate.zw, 0.0, 1.0));
}
