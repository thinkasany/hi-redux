# Git Subtree 
虽然电脑可以拉取最新代码，看到原作者的git信息。但上传到github后。读者却看不到原仓库作者的git信息了。通过git subtree 管理子仓库，保留多个子仓库原作者的提交信息。
cd P1项目的路径
git subtree add --prefix=用来放S项目的相对路径 S项目git地址 xxx分支
https://segmentfault.com/a/1190000003969060
redux % git subtree add --prefix=hello-redux  https://github.com/lxchuan12/redux-analysis.git master