# Generated by Django 5.1.1 on 2024-11-02 17:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('likehome_api', '0009_profile_reward_points'),
    ]

    operations = [
        migrations.AddField(
            model_name='reservation',
            name='rewards_earned',
            field=models.IntegerField(default=0),
        ),
    ]
