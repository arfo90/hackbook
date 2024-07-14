## Error Handling

Go, unlike many other languages, doesn't provide a `try`, `catch` mechanism and instead enforces error handling through the `error` package.

### Basic Error

```go
func validateIfBelowHundred(number uint) (validation bool, err error) {
    if number > 99 {
        err = errors.New("The number is higher than 99")
        return false, err
    }

    return true, nil
}
```
