# Pecans

Pretty Easy Two Cans & String API wrapper for version 1.68.

Typescript module that can also be used in Python, .NET, and Java using
[jsii](https://github.com/aws/jsii). Requires node to be installed to use the
language bindings.

## Requirements

- `node`

## Python Example

```py
from pecans import Client

client = Client("AUTH COOKIE HERE")
res = client.messages.folder_view()
for msg in res.messages:
    print(msg.preview)
```

## C# Example

```cs
public class Program
{
    public static void Main(string[] args)
    {
        var client = new Pecans.Client("AUTH COOKIE HERE");
        var res = client.Messages.FolderView();
        foreach (var msg in res.Messages)
        {
            Console.WriteLine(msg.Preview);
        }
    }
}
```
