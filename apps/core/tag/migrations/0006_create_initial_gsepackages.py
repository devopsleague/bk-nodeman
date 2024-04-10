# Generated by Django 3.2.4 on 2024-02-29 09:40
from typing import List

from django.db import migrations

from apps.node_man.models import GseConfigEnv, GsePackages


def create_initial_gse_packages(apps, schema_editor):
    extra_env_infos = GseConfigEnv.objects.all()

    gse_package_list: List[GsePackages] = []
    for extra_env_obj in extra_env_infos:
        gse_package_list.append(
            GsePackages(
                pkg_name=str(extra_env_obj),
                version=extra_env_obj.version,
                project=extra_env_obj.agent_name,
                pkg_size=0,
                pkg_path="",
                md5="",
                location="",
                os=extra_env_obj.os,
                cpu_arch=extra_env_obj.cpu_arch,
            )
        )

    GsePackages.objects.bulk_create(gse_package_list)


class Migration(migrations.Migration):

    dependencies = [
        ("tag", "0005_create_initial_tags"),
    ]

    operations = [
        migrations.RunPython(create_initial_gse_packages),
    ]
