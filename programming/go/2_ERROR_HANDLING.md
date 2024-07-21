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

#### Note : return value skiping

In this particular case, error can be redundant since function also provide validation boolean, in this case error value can be ignored using '_', otherwise it will throw an compile time error since Go doesn't like unused variables.  

```go
ok, _ := validateIfBelowHundred(89)

if !ok {
    // do something
}
```

### Reduce Error Handling Boilerplate

Go provides a way to reduce error handling boilerplate by using `panic` and `recover` mechanism. 

```go
func validateIfBelowHundred(number uint) (validation bool) {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("Recovered from ", r)
            validation = false
        }
    }()

    if number > 99 {
        panic("The number is higher than 99")
    }

    return true
}
```

It is important to note that `panic` and `recover` should be used sparingly and only in cases where it is absolutely necessary.

### Reducing Error Handling Boilerplate with helper function

Using helper function to reduce error handling boilerplate but it also might hide some of the error handling logic. and infact increase the complexity of the code.

```go
value := interfaceValue.(concreteType)
```

```go
func httpcall() (resp *http.Response, err error) {
    resp := must(http.Get("http://example.com")).(*http.Response)

return resp, nil

}

func must(param any, err error) any {
    if err != nil {
        // handle error
    }

    return param
}
```
#### Note : Type assertion 

type assertion is a mechanism that allows you to extract a value of a specific type from an interface value. It is used when you have an interface value and you want to access the underlying concrete value of a specific type

```go
resp := must(http.Get("http://example.com")).(*http.Response)
```

Why use type assertion?

1. Accessing specific methods or fields: When you have an interface value, you can only access the methods defined in the interface. If you need to access methods or fields specific to the underlying concrete type, you need to use type assertion to extract the concrete value.
2. Type switches: Type assertion is often used in conjunction with type switches to perform different actions based on the underlying concrete type of an interface value.
3. Avoiding type casting: Type assertion provides a way to extract the underlying value without relying on type casting, which can be less safe and more prone to runtime errors.

In the above example, `must` function is using type assertion to convert the interface to the desired type. This can be dangerous if the type assertion fails, it will cause a runtime panic.


Type assertion with ok (safe type assertion):

```go
value, ok := interfaceValue.(concreteType)
if !ok {
    // handle error
}
```

### Custome Error

Go allows to create custom error types by implementing the `Error()` method on a struct.

```go

type Error interface {
    Error() string
}

type CustomError struct {
    message string
}

func (e *CustomError) Error() string {
    return e.message
}


func validateIfBelowHundred(number uint) (validation bool, err error) {
    if number > 99 {
        err = &CustomError{"The number is higher than 99"}
        return false, err
    }

    return true, nil
}
```

### Error Wrapping

Go 1.13 introduced the `errors` package which provides a way to wrap errors with additional context. This can be useful when you want to add more information to an existing error without losing the original error message.

```go
package main

import (
    "errors"
    "fmt"
)

func main() {
    err := errors.New("original error")
    wrappedErr := fmt.Errorf("wrapped error: %w", err)

    fmt.Println(wrappedErr)
    // unwrap the error
    fmt.Println(errors.Unwrap(wrappedErr))
}
```

In the above example, the `fmt.Errorf` function is used to wrap the original error with additional context. The `%w` verb is used to indicate that the error should be wrapped. When the error is printed, the output will include both the original error message and the additional context.

Wrapping can also help to build customize error messages

```go
type ConnectionError struct {
	Host string
	Port int
	Err  error
}

func (err *ConnectionError) Error() string {
	return fmt.Sprintf("Error connecting to %s at port %d", err.Host,
	err.Port)
}

func (err *ConnectionError) Unwrap() error {
    return err.Err
}

// example
func connect(host string, port int) error {
    _, err := net.Dial("tcp", fmt.Sprintf("%s:%d", host, port))
    if err != nil {
        return &ConnectionError{Host: host, Port: port, Err: err}
    }
    return nil
}

func main() {
    err := connect("example.com", 80)
    if err != nil {
        fmt.Println(err)
        if connectionErr, ok := err.(*ConnectionError); ok {
            fmt.Println("Underlying error:", connectionErr.Err)
        }
    }
}
```

### Inespecting Errors

Go 1.13 introduced the `errors.Is` and `errors.As` functions to help with inspecting errors. These functions can be used to check if an error is of a specific type or to extract a specific error type from a chain of wrapped errors.

```go
package main

import (
    "errors"
    "fmt"
)

type CustomError struct {
    message string
}

func (e *CustomError) Error() string {
    return e.message
}

func main() {
    err := &CustomError{"custom error"}
    wrappedErr := fmt.Errorf("wrapped error: %w", err)

    // check if the error is of type CustomError
    if errors.Is(wrappedErr, &CustomError{}) {
        fmt.Println("Error is of type CustomError")
    }

    // extract the CustomError from the wrapped error
    var customErr *CustomError
    if errors.As(wrappedErr, &customErr) {
        fmt.Println("Extracted CustomError:", customErr)
    }
}
```

'errors.Is' function is used to check if an error is of a specific type. It returns true if the error is of the specified type or if it is wrapped in an error of the specified type.

'errors.As' function is used to extract a specific error type from a chain of wrapped errors. It returns true if the error is of the specified type or if it is wrapped in an error of the specified type, and assigns the extracted error to the provided variable'

```go

type ConnectionError struct {
    Host string
    Port int
    Err  error
}

func (err *ConnectionError) Error() string {
    return fmt.Sprintf("Error connecting to %s at port %d", err.Host,
    err.Port)
}

func (err *ConnectionError) Unwrap() error {
    return err.Err
}

func main() {
    err := connect("example.com", 80)
    if err != nil {
        fmt.Println(err)
        var connectionErr *ConnectionError
        if errors.As(err, &connectionErr) {
            fmt.Println("Host:", connectionErr.Host)
            fmt.Println("Port:", connectionErr.Port)
            fmt.Println("Underlying error:", connectionErr.Err)
        }
    }
}
```

One of the usage of error inspection is to skip the error that is not relevant to the current context and therfore can be ignored.

```go

func AssertErr(err error) error {
	if err == nil || errors.Is(err, connectionError) {
		return nil
	}

    return err
}
```
### Panic and Recover

Go provides a mechanism to handle panics using the `panic` and `recover` functions. A panic is a runtime error that causes the program to crash. It is typically used to indicate that something unexpected has happened and the program cannot continue.

```go
package main

import "fmt"

func main() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("Recovered from ", r)
        }
    }()

    panic("something went wrong")
}
```

#### Note : Be mindful of Panic and Recover

1. Avoid using panic for expected error conditions. Use it only for truly unrecoverable situations.
2. If you must use recover, do it in smaller, more focused functions rather than in main(). This allows for more granular control and better testability.
3. Implement a structured logging system to capture detailed information about panics when they occur.
4. Use error wrapping (introduced in Go 1.13) to provide more context when propagating errors.
5. Consider using a middleware or decorator pattern for centralized error handling in larger applications.
6. Always thoroughly test error paths and recovery mechanisms.

### Graceful Shutdown

Graceful shutdown is the process of shutting down a program in a controlled manner, allowing it to clean up resources and complete any pending tasks before exiting. This is especially important for long-running services or applications that need to handle shutdown signals gracefully.

```go
ch := make(chan os.Signal)
signal.Notify(ch, os.Interrupt)

go func() {
	<-ch
	// clean up before graceful exit
	os.Exit(0)
}()
```

example: [graceful_shutdown.go](https://github.com/arfo90/hackbook/blob/main/programming/go/examples/graceful_shutdown/main.go)

### packages to handle errors

// todo

### Error Handling Best Practices

1. **Don't ignore errors**: Always check for errors and handle them appropriately. Ignoring errors can lead to unexpected behavior and bugs in your code.
2. **Wrap errors with context**: When returning errors from functions, consider wrapping them with additional context to provide more information about the error.
3. **Use custom error types**: Create custom error types for different types of errors to make it easier to handle and differentiate between them.
4. **Handle errors at the appropriate level**: Handle errors at the appropriate level in your code. Don't handle errors too early or too late, handle them where they occur.
5. **Use panic and recover sparingly**: Avoid using `panic` and `recover` unless absolutely necessary. They should be used for exceptional cases only.
6. **Log errors**: Log errors to help with debugging and troubleshooting. Include relevant information in the log messages to make it easier to identify and fix issues.
