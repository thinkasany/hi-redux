# Git Subtree 
虽然电脑可以拉取最新代码，看到原作者的git信息。但上传到github后。读者却看不到原仓库作者的git信息了。通过git subtree 管理子仓库，保留多个子仓库原作者的提交信息。
```
cd P1项目的路径
git subtree add --prefix=用来放S项目的相对路径 S项目git地址 xxx分支
https://segmentfault.com/a/1190000003969060
git subtree add --prefix=hi-redux  https://github.com/lxchuan12/redux-analysis.git master
https://segmentfault.com/a/1190000003969060
git subtree add --prefix=hi-test  https://github.com/thinkasany/test.git master
```

# git rebase
```
1. git rebase -i  HEAD~1 
2. 键盘输入insert【i】（键盘按键i） 将pick改为e/edit ，esc（键盘按键），: wq （保存并退出）
3. git commit --amend --message="think change message"
4. git rebase --continue
5. git push
6. # s, squash = use commit, but meld into previous commit

```
