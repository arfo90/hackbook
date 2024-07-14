## Error Handling

Go, unlike many other languages, doesn't provide a `try`, `catch` mechanism and instead enforces error handling through the `error` package.

### Basic Error

Simple Error syntex with Go

```go
func validateIfBelowHundred(number uint) (validation bool, err error) {
    if number > 99 {
        err = errors.New("The number is higher than 99")
        return false, err
    }

    return true, nil
}
```

Later caller can use the error value to determine and decide about handling it


```go
ok, err := validateIfBelowHundred(89)

if err != nil {
    // do something
}
```

#### Note

In this particular case, error can be redundant since function also provide validation boolean, in this case error value can be ignored using '_'  

```go
ok, _ := validateIfBelowHundred(89)

if !ok {
    // do something
}
```

