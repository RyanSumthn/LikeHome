from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from .session import set_current_user
# import Django default user model

#TODO: accept username login info in request and return success/fail messages
@api_view(['POST'])
def login(request):
    print(request.data.get('username'))
    print(request.data.get('password'))

    # set_current_user()

    return Response({'status': 'OK'}, status=status.HTTP_200_OK)