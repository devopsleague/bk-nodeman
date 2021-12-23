# -*- coding: utf-8 -*-
"""
Tencent is pleased to support the open source community by making 蓝鲸 (Blueking) available.
Copyright (C) 2017-2022 THL A29 Limited, a Tencent company. All rights reserved.
Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
You may obtain a copy of the License at https://opensource.org/licenses/MIT
Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
"""
from apps.iam.handlers.resources import Business, generate_all_resources_json
from apps.utils.unittest import testcase


class TestResource(testcase.CustomBaseTestCase):
    def test_to_json(self):
        self.assertIsInstance(Business.to_json(), dict)

    def test_generate_all_resources_json(self):
        resource_json = generate_all_resources_json()
        self.assertIsInstance(resource_json, list)
