# Generated by Django 5.1.1 on 2024-11-16 23:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('likehome_api', '0014_alter_message_content'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='phone_number',
            field=models.CharField(default='N/A', max_length=10),
        ),
    ]