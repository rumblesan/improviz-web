# Improviz Web

A web version of Improviz

## Core

The main parser and gfx engine of Improviz Web is available separately so it can be embedded into other JavaScript systems.

The bundle exports a single function `createImproviz` which can be called and passed a canvas, and will return either one of two objects.

```
{
  status: 'error',
  message: 'error message text',
}
```

or

```
{
  status: 'ok',
  improviz: <ImprovizInstanceObject>
}
```

### Improviz Instance API

The instance of the Improviz object has a fairly basic API.

* `evaluate(program)`
  Give Improviz a program to evaluate each frame. Will return an array with any RuntimeErrors.
* `genAnimateFunc()`
  Returns the animation function that should then be called each frame. This function will also return an array with any RuntimeErrors each time it's called.

#### RuntimeErrors

These are simple objects that can be used to alert the user to errors in the program. They have the following attributes.

* `name`
    The name of the error
* `line`
    A zero indexed integer denoting which line the error is on
* `character`
    A zero indexed integer denoting which character the error starts at
* `message`
    A message giving further information about the error
* `length`
    An integer stating how many characters long the error token is, useful if underlining it is required.


## Contact

Drop me an email at guy@rumblesan.com


## License

BSD License.
