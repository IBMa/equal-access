# jest

This folder covers "baseline basics".

We have two tests - one referencing a baseline (stored at `baselines/IMG_BASELINE.json`) and one that does not.

A scan was run previously that detected an issue. That scan was saved as a baseline. The checker will ignore issues stored in the baseline. This feature allows a team to snapshot where they're at to prevent new issues from being introduced. This also allows a team to fail on potential violations, but then store items in the baseline that they've assessed and determined were being addressed in some way.

When you `npm install` and `npm test` in this folder, you should expect to see one test fail and one test pass.

At the time of this commit, if you look at the results for `Image missing alt without Baseline` you will see a failure including:

```
 - Message: The image has neither an accessible name nor is marked as decorative or redundant
      Level: violation
      XPath: /html[1]/body[1]/div[1]/img[1]
      Snippet: <img src="hello.png">
      Help: https://able.ibm.com/rules/archives/2024.06.17/doc/en-US/img_alt_valid.html#%7B%22message%22%3A%22The%20image%20has%20neither%20an%20accessible%20name%20nor%20is%20marked%20as%20decorative%20or%20redundant%22%2C%22snippet%22%3A%22%3Cimg%20src%3D%5C%22hello.png%5C%22%3E%22%2C%22value%22%3A%5B%22VIOLATION%22%2C%22FAIL%22%5D%2C%22reasonId%22%3A%22fail_no_alt%22%2C%22ruleId%22%3A%22img_alt_valid%22%2C%22msgArgs%22%3A%5B%5D%7D
```

We can then add to the `document.body.innerHTML` in that test, following the linked `help` above, to remove the violation. In this example, a simple way is to add an appopriate `alt` attribute.

A useful exercise would be to extend this example to make use of the provided HelloWidget component.
