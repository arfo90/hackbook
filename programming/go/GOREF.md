Here's the content formatted as a Markdown file:

```markdown
# Go

## Packaging, module and Project structure

To get started and initializing new go module, 

```sh
go mod init {module-name}
```

Use 'go mod tidy' to remove direct dependencies "indirect" flag. This command also helps to remove unused or removed package trace from go.mod file

To see which version of third party lib is in use, following git command can be used:

```sh
git ls-remote -t https://github.com/gorilla/mux.git
```

Result:
```
0eeaf8392f5b04950925b8a69fe70f110fa7cbfc refs/tags/v1.1
b12896167c61cb7a17ee5f15c2ba0729d78793db refs/tags/v1.2.0
392c28fe23e1c45ddba891b0320b3b5df220beea refs/tags/v1.3.0
bcd8bc72b08df0f70df986b97f95590779502d31 refs/tags/v1.4.0
24fca303ac6da784b9e8269f724ddeb0b2eea5e7 refs/tags/v1.5.0
7f08801859139f86dfafd1c296e2cba9a80d292e refs/tags/v1.6.0
53c1911da2b537f792e7cafcb446b05ffe33b996 refs/tags/v1.6.1
e3702bed27f0d39777b0b37b664b6280e8ef8fbf refs/tags/v1.6.2
a7962380ca08b5a188038c69871b8d3fbdf31e89 refs/tags/v1.7.0
c5c6c98bc25355028a63748a498942a6398ccd22 refs/tags/v1.7.1
ed099d42384823742bba0bf9a72b53b55c9e2e38 refs/tags/v1.7.2
00bdffe0f3c77e27d2cf6f5c70232a2d3e4d9c15 refs/tags/v1.7.3
75dcda0896e109a2a22c9315bca3bb21b87b2ba5 refs/tags/v1.7.4
98cb6bf42e086f6af920b965c38cacc07402d51b refs/tags/v1.8.0
b4617d0b9670ad14039b2739167fd35a60f557c5 refs/tags/v1.8.1
```
```
