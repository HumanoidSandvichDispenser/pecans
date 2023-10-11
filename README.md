# Pewcans

Pretty Easy Wrapper for Two Cans & String API for version 1.68.

Typescript module that can also be used in Python, .NET, and Java using
[jsii](https://github.com/aws/jsii).

## Example

```py
from pewcans import Client

client = Client("AUTH COOKIE HERE")
res = client.messages.folder_view()
for msg in res.messages:
    print(msg.preview)
```
