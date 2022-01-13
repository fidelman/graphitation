"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[922],{3905:function(e,t,a){a.d(t,{Zo:function(){return m},kt:function(){return s}});var n=a(7294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function i(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?i(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):i(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function o(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},i=Object.keys(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)a=i[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var c=n.createContext({}),p=function(e){var t=n.useContext(c),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},m=function(e){var t=p(e.components);return n.createElement(c.Provider,{value:t},e.children)},u={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,i=e.originalType,c=e.parentName,m=o(e,["components","mdxType","originalType","parentName"]),d=p(a),s=r,f=d["".concat(c,".").concat(s)]||d[s]||u[s]||i;return a?n.createElement(f,l(l({ref:t},m),{},{components:a})):n.createElement(f,l({ref:t},m))}));function s(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=a.length,l=new Array(i);l[0]=d;var o={};for(var c in t)hasOwnProperty.call(t,c)&&(o[c]=t[c]);o.originalType=e,o.mdxType="string"==typeof e?e:r,l[1]=o;for(var p=2;p<i;p++)l[p]=a[p];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}d.displayName="MDXCreateElement"},4525:function(e,t,a){a.r(t),a.d(t,{frontMatter:function(){return o},contentTitle:function(){return c},metadata:function(){return p},toc:function(){return m},default:function(){return d}});var n=a(7462),r=a(3366),i=(a(7294),a(3905)),l=["components"],o={sidebar_position:4,id:"use-refetchable-fragment",title:"useRefetchableFragment",description:"API reference for useRefetchableFragment, a React hook used to refetch fragment data",keywords:["refetch","fragment"]},c=void 0,p={unversionedId:"apollo-react-relay-duct-tape/use-refetchable-fragment",id:"apollo-react-relay-duct-tape/use-refetchable-fragment",title:"useRefetchableFragment",description:"API reference for useRefetchableFragment, a React hook used to refetch fragment data",source:"@site/docs/apollo-react-relay-duct-tape/use-refetchable-fragment.md",sourceDirName:"apollo-react-relay-duct-tape",slug:"/apollo-react-relay-duct-tape/use-refetchable-fragment",permalink:"/graphitation/docs/apollo-react-relay-duct-tape/use-refetchable-fragment",editUrl:"https://github.com/microsoft/graphitation/tree/main/website/docs/apollo-react-relay-duct-tape/use-refetchable-fragment.md",tags:[],version:"current",sidebarPosition:4,frontMatter:{sidebar_position:4,id:"use-refetchable-fragment",title:"useRefetchableFragment",description:"API reference for useRefetchableFragment, a React hook used to refetch fragment data",keywords:["refetch","fragment"]},sidebar:"tutorialSidebar",previous:{title:"useFragment",permalink:"/graphitation/docs/apollo-react-relay-duct-tape/use-fragment"},next:{title:"usePaginationFragment",permalink:"/graphitation/docs/apollo-react-relay-duct-tape/use-pagination-fragment"}},m=[{value:"<code>useRefetchableFragment</code>",id:"userefetchablefragment",children:[{value:"Arguments",id:"arguments",children:[],level:3},{value:"TypeScript Parameters",id:"typescript-parameters",children:[],level:3},{value:"Return Value",id:"return-value",children:[],level:3},{value:"Behavior",id:"behavior",children:[],level:3}],level:2}],u={toc:m};function d(e){var t=e.components,a=(0,r.Z)(e,l);return(0,i.kt)("wrapper",(0,n.Z)({},u,a,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("h2",{id:"userefetchablefragment"},(0,i.kt)("inlineCode",{parentName:"h2"},"useRefetchableFragment")),(0,i.kt)("p",null,"You can use ",(0,i.kt)("inlineCode",{parentName:"p"},"useRefetchableFragment")," when you want to fetch and re-render a fragment with different data:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-tsx"},'import React from "react";\nimport {\n  graphql,\n  useRefetchableFragment,\n} from "@graphitation/apollo-react-relay-duct-tape";\n\nimport { CommentBodyRefetchQuery } from "./__generated__/CommentBodyRefetchQuery.graphql";\nimport { CommentBody_comment$key } from "./__generated__/CommentBody_comment.graphql";\n\ninterface Props {\n  comment: CommentBody_comment$key;\n}\n\nconst CommentBody: React.FC<Props> = (props) => {\n  const [data, refetch] = useRefetchableFragment<CommentBodyRefetchQuery>(\n    graphql`\n      fragment CommentBody_comment on Comment\n      @refetchable(queryName: "CommentBodyRefetchQuery") {\n        body(lang: $lang) {\n          text\n        }\n      }\n    `,\n    props.comment\n  );\n\n  return (\n    <>\n      <p>{data.body?.text}</p>\n      <Button\n        onClick={() => {\n          refetch({ lang: "SPANISH" }, { fetchPolicy: "store-or-network" });\n        }}\n      >\n        Translate Comment\n      </Button>\n    </>\n  );\n};\n\nexport default CommentBody;\n')),(0,i.kt)("h3",{id:"arguments"},"Arguments"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"fragment"),": GraphQL fragment specified using a ",(0,i.kt)("inlineCode",{parentName:"li"},"graphql")," template literal.",(0,i.kt)("ul",{parentName:"li"},(0,i.kt)("li",{parentName:"ul"},"This fragment must have a ",(0,i.kt)("inlineCode",{parentName:"li"},"@refetchable")," directive, otherwise using it will throw an error. The ",(0,i.kt)("inlineCode",{parentName:"li"},"@refetchable"),' directive can only be added to fragments that are "refetchable", that is, on fragments that are declared on the ',(0,i.kt)("inlineCode",{parentName:"li"},"Query")," type, or on a type that implements ",(0,i.kt)("inlineCode",{parentName:"li"},"Node")," (i.e. a type that has an ",(0,i.kt)("inlineCode",{parentName:"li"},"id"),")."),(0,i.kt)("li",{parentName:"ul"},"Note that you ",(0,i.kt)("em",{parentName:"li"},"do not")," need to manually specify a refetch query yourself. The ",(0,i.kt)("inlineCode",{parentName:"li"},"@refetchable")," directive will autogenerate a query with the specified ",(0,i.kt)("inlineCode",{parentName:"li"},"queryName"),". This will also generate TypeScript types for the query, available to import from the generated file: ",(0,i.kt)("inlineCode",{parentName:"li"},"<queryName>.graphql.ts"),"."))),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"fragmentReference"),": The ",(0,i.kt)("em",{parentName:"li"},"fragment reference")," is an opaque object that Apollo React/Relay Duct-Tape uses to read the data for the fragment from the store; more specifically, it contains information about which particular object instance the data should be read from.",(0,i.kt)("ul",{parentName:"li"},(0,i.kt)("li",{parentName:"ul"},"The type of the fragment reference can be imported from the generated TypeScript types, from the file ",(0,i.kt)("inlineCode",{parentName:"li"},"<fragment_name>.graphql.ts"),", and can be used to declare the type of your ",(0,i.kt)("inlineCode",{parentName:"li"},"Props"),". The name of the fragment reference type will be: ",(0,i.kt)("inlineCode",{parentName:"li"},"<fragment_name>$key"),".")))),(0,i.kt)("h3",{id:"typescript-parameters"},"TypeScript Parameters"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"TQuery"),": Type parameter that should corresponds the TypeScript type for the ",(0,i.kt)("inlineCode",{parentName:"li"},"@refetchable")," query. This type is available to import from the the auto-generated file: ",(0,i.kt)("inlineCode",{parentName:"li"},"<queryName>.graphql.ts"),"."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"TFragmentRef"),": Type parameter corresponds to the type of the fragment reference argument (i.e. ",(0,i.kt)("inlineCode",{parentName:"li"},"<fragment_name>$key"),"). This type usually does not need to be explicitly specified, and can be omitted to let TypeScript infer the concrete type.")),(0,i.kt)("h3",{id:"return-value"},"Return Value"),(0,i.kt)("p",null,"Tuple containing the following values"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"[0]"," ",(0,i.kt)("inlineCode",{parentName:"li"},"data"),": Object that contains data which has been read out from the store; the object matches the shape of specified fragment.",(0,i.kt)("ul",{parentName:"li"},(0,i.kt)("li",{parentName:"ul"},"The TypeScript type for data will also match this shape, and contain types derived from the GraphQL Schema."))),(0,i.kt)("li",{parentName:"ul"},"[1]"," ",(0,i.kt)("inlineCode",{parentName:"li"},"refetch"),": Function used to refetch the fragment with a potentially new set of variables.",(0,i.kt)("ul",{parentName:"li"},(0,i.kt)("li",{parentName:"ul"},"Arguments:",(0,i.kt)("ul",{parentName:"li"},(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"variables"),": Object containing the new set of variable values to be used to fetch the ",(0,i.kt)("inlineCode",{parentName:"li"},"@refetchable")," query.",(0,i.kt)("ul",{parentName:"li"},(0,i.kt)("li",{parentName:"ul"},"These variables need to match GraphQL variables referenced inside the fragment."),(0,i.kt)("li",{parentName:"ul"},"However, only the variables that are intended to change for the refetch request need to be specified; any variables referenced by the fragment that are omitted from this input will fall back to using the value specified in the original parent query. So for example, to refetch the fragment with the exact same variables as it was originally fetched, you can call ",(0,i.kt)("inlineCode",{parentName:"li"},"refetch({})"),"."),(0,i.kt)("li",{parentName:"ul"},"Similarly, passing an ",(0,i.kt)("inlineCode",{parentName:"li"},"id")," value for the ",(0,i.kt)("inlineCode",{parentName:"li"},"$id")," variable is ",(0,i.kt)("em",{parentName:"li"},(0,i.kt)("em",{parentName:"em"},"optional")),", unless the fragment wants to be refetched with a different ",(0,i.kt)("inlineCode",{parentName:"li"},"id"),". When refetching a ",(0,i.kt)("inlineCode",{parentName:"li"},"@refetchable")," fragment, Apollo React/Relay Duct-Tape will already know the id of the rendered object."))),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"options"),": ",(0,i.kt)("em",{parentName:"li"},(0,i.kt)("em",{parentName:"em"},"[Optional]"))," options object",(0,i.kt)("ul",{parentName:"li"},(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"fetchPolicy"),": Determines if cached data should be used, and when to send a network request based on cached data that is available. See the ",(0,i.kt)("a",{parentName:"li",href:"../../guided-tour/reusing-cached-data/fetch-policies/"},"Fetch Policies")," section for full specification."),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"onComplete"),": Function that will be called whenever the refetch request has completed, including any incremental data payloads."))))),(0,i.kt)("li",{parentName:"ul"},"Return value:",(0,i.kt)("ul",{parentName:"li"},(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("inlineCode",{parentName:"li"},"disposable"),": Object containing a ",(0,i.kt)("inlineCode",{parentName:"li"},"dispose")," function. Calling ",(0,i.kt)("inlineCode",{parentName:"li"},"disposable.dispose()")," will cancel the refetch request."))),(0,i.kt)("li",{parentName:"ul"},"Behavior:",(0,i.kt)("ul",{parentName:"li"},(0,i.kt)("li",{parentName:"ul"},"Calling ",(0,i.kt)("inlineCode",{parentName:"li"},"refetch")," with a new set of variables will fetch the fragment again ",(0,i.kt)("em",{parentName:"li"},"with the newly provided variables"),". Note that the variables you need to provide are only the ones referenced inside the fragment. In this example, it means fetching the translated body of the currently rendered Comment, by passing a new value to the ",(0,i.kt)("inlineCode",{parentName:"li"},"lang")," variable.")))))),(0,i.kt)("h3",{id:"behavior"},"Behavior"),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"The component is automatically subscribed to updates to the fragment data: if the data for this particular ",(0,i.kt)("inlineCode",{parentName:"li"},"Comment")," is updated anywhere in the app (e.g. via fetching new data, or mutating existing data), the component will automatically re-render with the latest updated data.")))}d.isMDXComponent=!0}}]);