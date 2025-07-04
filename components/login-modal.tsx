"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@radix-ui/react-checkbox";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginModal({ open, onClose }: LoginModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { login, register } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isRegister && !nickname.trim()) {
      setError("ニックネームとメールアドレスを入力してください。");
      return;
    }

    if (isRegister && nickname.length < 2) {
      setError("ニックネームは2文字以上で入力してください。");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("有効なメールアドレスを入力してください。");
      return;
    }

    if (password !== confirmPassword) {
      setError("パスワードが一致しません。");
      return;
    }

    setIsSubmitting(true);

    const result = isRegister ? await register(nickname.trim(), email.trim(), password.trim()) : await login(email.trim(), password.trim());

    if (result.success) {
      toast({
        title: "登録完了",
        description: `${nickname}さん、momoLandへようこそ！`,
      });
      setNickname("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      onClose();
    } else {
      setError(result.error || "登録に失敗しました。");
    }

    setIsSubmitting(false);
  };

  const handleClose = () => {
    setNickname("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-pink-500" />
            <span>{isRegister ? "ユーザー登録" : "ログイン"}</span>
          </DialogTitle>
          <DialogDescription>
            {isRegister
              ? "ニックネームとメールアドレスを入力して、momoLandに参加しましょう。"
              : "メールアドレスとパスワードを入力して、momoLandにログインしましょう。"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label
                htmlFor="nickname"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                ニックネーム *
              </label>
              <Input
                id="nickname"
                type="text"
                placeholder="あなたのニックネーム"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                ※ニックネームは他のユーザーと重複できません
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              メールアドレス *
            </label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              ※トラブル報告時の連絡用です
            </p>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              パスワード
            </label>
            <Input
              id="password"
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
              disabled={isSubmitting}
            />
          </div>

          {isRegister && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                パスワード確認
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="パスワード確認"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full"
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="flex w-full items-center justify-end space-x-2">
            <Checkbox
              id="register"
              checked={isRegister}
              onCheckedChange={() => setIsRegister(!isRegister)}
              className="cursor-pointer"
            />
            <label
              htmlFor="register"
              className="block text-sm font-medium text-pink-600 mb-2 cursor-pointer hover:text-pink-700"
            >
              {isRegister ? "ログイン" : "ユーザー登録"}
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              登録後にできること：
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• ライブチャット体験記の投稿</li>
              <li>• グループチャットへの参加・作成</li>
              <li>• いいねやコメントの投稿</li>
              <li>• プライベートチャットルームの作成</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-pink-600 hover:bg-pink-700"
            >
              {isRegister ? (isSubmitting ? "登録中..." : "登録する") : (isSubmitting ? "ログイン中..." : "ログインする")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 bg-transparent"
            >
              キャンセル
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
