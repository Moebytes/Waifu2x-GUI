# Typescript Style Guide

If you want to contribute to my repository, I ask that you follow my code styling. If something doesn't appear in this guide then I have no specific preference 
for it (but this may get updated in the future as needed).

**1. Naming Scheme** \
Variables and functions use `camelCase`. Classes and interfaces use `PascalCase`. 

```ts
// x Bad
class aClass {}
const Method = () => {}
let Hi = 1
// ✓ Good
class AClass {}
const method = () => {}
let hi = 1
```

**2. Braces** \
Always put the function brace on the same line.

```ts
// x Bad
const a = () =>
{
}
// ✓ Good
const a = () => {
}
```

**3. No Semicolons** \
Do not use semicolons, unless when needed to avoid a syntax error. They are ugly.

```ts
// x Bad
let a = 5;
// ✓ Good
let a = 5
```

**4. Double quote strings** \
Use double quotes for string literals, not single quotes. 

```ts
// x Bad
let a = 'hello'
// ✓ Good
let a = "hello"
```

**5. No spaces on imports** \
No spaces when importing classes.

```ts
// x Bad
import { Test } from "test"
// ✓ Good
import {Test} from "test"
```

**6. Use arrow functions** \
Always use arrow functions to avoid having to bind this.

```ts
// x Bad
async function func(str: string) {}
// ✓ Good
const func = async (str: string) => {}
```

**7. No var** \
Do not use var when declaring variables.

```ts
// x Bad
var a = 1
// ✓ Good
let a = 1
const b = 2
```

**8. No double equals** \
Do not use the double equals/not equals.

```ts
// x Bad
if (a == 1)
if (a != 1)
// ✓ Good
if (a === 1)
if (a !== 1)
```

**9. Do not fill with comments** \
Do not fill the code with excessive comments. A documentation comment for the function is fine. If you have 
to comment every other line, you are making bad code.

```ts
// x Bad
// set a to 1
let a = 1
// ✓ Good
/**
* Gets a user from the api
*/
public getUser = async () => {}
```

**10. Use implicit return types** \
Let typescript infer the return type whenever possible. This helps when refactoring, since changes to the function will always update to the correct return type.

```ts
// x Bad
public func = async (str: string): Promise<string> => {}
// ✓ Good
public func = async (str: string) => {}
```

**11. Interface vs type** \
Interface should be used for large object-like types. Type is used for simpler union types or when generics are needed.

```ts
// Interface
interface User {
  name: string
  birthday: string
}
// Type
type Theme = "light" | "dark"
```

**12. Minimize any usage** \
Typed code minimizes bugs. Therefore you should reduce the usage of any type as much as possible, although sometimes it is 
unavoidable.

```ts
// x Bad
let x = [] as any
// ✓ Good
let x = [] as string[]
```

**13. Use async/await** \
Use async/await. Avoid nested callbacks hell. You can convert a callback to async/await like this:

```ts
await new Promise<void>((resolve) => {
  callback((result) => {
    resolve()
  })
}
```

**14. Use array methods for simple logic** \
Prefer array methods like map and filter for simple logic over a for loop. For complex logic, you may 
use a for loop instead.

```ts
// x Bad
for (let i = 0; i < a.length; i++) {
  a[i] += 5
}
// ✓ Good
a = a.map(x => x + 5)
```

**15. Use index signature over record type** \
Prefer index signature over Record.

```ts
// x Bad
let x = {} as Record<string, number>
// ✓ Good
let x = {} as {[key: string]: number}
```
