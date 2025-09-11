import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/signup">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại đăng ký
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Điều khoản sử dụng</CardTitle>
            <p className="text-muted-foreground">Cập nhật lần cuối: September 2025</p>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Chấp nhận điều khoản</h2>
                <p>
                  Bằng việc truy cập và sử dụng ứng dụng học từ vựng tiếng Anh của chúng tôi, 
                  bạn đồng ý tuân thủ và chịu ràng buộc bởi các điều khoản và điều kiện này.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">2. Mô tả dịch vụ</h2>
                <p>
                  Ứng dụng của chúng tôi cung cấp công cụ học từ vựng tiếng Anh thông qua việc 
                  tạo đoạn văn có chứa các từ vựng do người dùng cung cấp.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">3. Tài khoản người dùng</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Bạn có trách nhiệm bảo mật thông tin tài khoản của mình</li>
                  <li>Bạn phải cung cấp thông tin chính xác khi đăng ký</li>
                  <li>Mỗi người dùng chỉ được tạo một tài khoản</li>
                  <li>Không được chia sẻ tài khoản với người khác</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">4. Quyền và nghĩa vụ của người dùng</h2>
                <p><strong>Quyền:</strong></p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Sử dụng tất cả tính năng của ứng dụng</li>
                  <li>Lưu trữ và quản lý dữ liệu học tập cá nhân</li>
                  <li>Yêu cầu hỗ trợ kỹ thuật</li>
                </ul>
                
                <p><strong>Nghĩa vụ:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Tuân thủ các điều khoản sử dụng</li>
                  <li>Không sử dụng ứng dụng cho mục đích bất hợp pháp</li>
                  <li>Không spam hoặc gửi nội dung không phù hợp</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">5. Bảo mật dữ liệu</h2>
                <p>
                  Chúng tôi cam kết bảo vệ dữ liệu cá nhân của bạn theo chính sách bảo mật. 
                  Dữ liệu học tập của bạn được mã hóa và lưu trữ an toàn.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">6. Chính sách hoàn tiền</h2>
                <p>
                  Hiện tại ứng dụng miễn phí. Trong trường hợp có gói trả phí trong tương lai, 
                  chính sách hoàn tiền sẽ được thông báo rõ ràng.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">7. Giới hạn trách nhiệm</h2>
                <p>
                  Chúng tôi không chịu trách nhiệm cho bất kỳ thiệt hại nào phát sinh từ việc 
                  sử dụng ứng dụng, bao gồm nhưng không giới hạn ở mất dữ liệu hoặc gián đoạn dịch vụ.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">8. Thay đổi điều khoản</h2>
                <p>
                  Chúng tôi có quyền cập nhật các điều khoản này bất kỳ lúc nào. 
                  Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên ứng dụng.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-3">9. Liên hệ</h2>
                <p>
                  Nếu có câu hỏi về điều khoản sử dụng, vui lòng liên hệ: 
                  <br />
                  Email: support@englishlearning.com
                  <br />
                  Điện thoại: 1900-xxxx
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
